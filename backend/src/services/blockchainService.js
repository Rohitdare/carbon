const { Gateway, Wallets } = require('fabric-network');
const { logger } = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class BlockchainService {
  constructor() {
    this.gateway = new Gateway();
    this.wallet = null;
    this.network = null;
    this.contract = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing blockchain service...');
      
      // Create wallet
      const walletPath = path.join(process.cwd(), 'wallet');
      this.wallet = await Wallets.newFileSystemWallet(walletPath);

      // Load connection profile
      const connectionProfilePath = path.join(process.cwd(), 'network-config', 'connection-profile.json');
      
      let connectionProfile;
      if (fs.existsSync(connectionProfilePath)) {
        connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
      } else {
        logger.warn('Connection profile not found, using default configuration');
        // Create a basic connection profile for development
        connectionProfile = {
          name: 'carbon-credits-network',
          version: '1.0.0',
          client: {
            organization: 'GovernmentMSP',
            connection: {
              timeout: {
                peer: {
                  endorser: '300'
                }
              }
            }
          },
          organizations: {
            GovernmentMSP: {
              mspid: 'GovernmentMSP',
              peers: ['peer0.government.example.com'],
              certificateAuthorities: ['ca.government.example.com']
            }
          },
          orderers: {
            'orderer.example.com': {
              url: 'grpc://localhost:7050'
            }
          },
          peers: {
            'peer0.government.example.com': {
              url: 'grpc://localhost:7051'
            }
          },
          certificateAuthorities: {
            'ca.government.example.com': {
              url: 'https://localhost:7054',
              caName: 'ca.government.example.com'
            }
          }
        };
        
        // Ensure directory exists
        const networkConfigDir = path.dirname(connectionProfilePath);
        if (!fs.existsSync(networkConfigDir)) {
          fs.mkdirSync(networkConfigDir, { recursive: true });
        }
        
        fs.writeFileSync(connectionProfilePath, JSON.stringify(connectionProfile, null, 2));
      }

      const connectionOptions = {
        wallet: this.wallet,
        identity: process.env.BLOCKCHAIN_USER_ID || 'admin',
        discovery: { enabled: true, asLocalhost: true }
      };

      await this.gateway.connect(connectionProfile, connectionOptions);

      // Get network and contract
      this.network = await this.gateway.getNetwork(process.env.BLOCKCHAIN_CHANNEL_NAME || 'carbon-credits-channel');
      this.contract = this.network.getContract(process.env.BLOCKCHAIN_CHAINCODE_NAME || 'carbon-credits');
      
      this.isInitialized = true;
      logger.info('✅ Blockchain service initialized successfully');
    } catch (error) {
      logger.error('❌ Blockchain service initialization failed:', error);
      // Don't throw error in development mode
      if (process.env.NODE_ENV === 'production') {
        throw error;
      } else {
        logger.warn('Blockchain service not available in development mode');
        this.isInitialized = false;
      }
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.isInitialized) {
      throw new Error('Blockchain service is not available');
    }
  }

  async createCarbonCredit(creditData) {
    try {
      await this.ensureInitialized();
      
      logger.info(`Creating carbon credit: ${creditData.id}`);
      
      const result = await this.contract.submitTransaction(
        'CreateCredit',
        creditData.id,
        creditData.projectId,
        creditData.ownerId,
        creditData.amount.toString(),
        creditData.type,
        creditData.verificationId,
        creditData.mrvReportId
      );
      
      const response = JSON.parse(result.toString());
      logger.info(`Carbon credit created successfully: ${creditData.id}`);
      
      return {
        success: true,
        transactionHash: result.toString(),
        creditId: creditData.id,
        amount: creditData.amount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error creating carbon credit on blockchain:', error);
      throw error;
    }
  }

  async issueCarbonCredit(creditId) {
    try {
      await this.ensureInitialized();
      
      logger.info(`Issuing carbon credit: ${creditId}`);
      
      const result = await this.contract.submitTransaction('IssueCredit', creditId);
      
      const response = JSON.parse(result.toString());
      logger.info(`Carbon credit issued successfully: ${creditId}`);
      
      return {
        success: true,
        transactionHash: result.toString(),
        creditId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error issuing carbon credit on blockchain:', error);
      throw error;
    }
  }

  async transferCarbonCredit(creditId, fromOwner, toOwner, amount, transferType, price) {
    try {
      await this.ensureInitialized();
      
      logger.info(`Transferring carbon credit: ${creditId} from ${fromOwner} to ${toOwner}`);
      
      const result = await this.contract.submitTransaction(
        'TransferCredit',
        creditId,
        fromOwner,
        toOwner,
        amount.toString(),
        transferType,
        price.toString()
      );
      
      const response = JSON.parse(result.toString());
      logger.info(`Carbon credit transferred successfully: ${creditId}`);
      
      return {
        success: true,
        transactionHash: result.toString(),
        creditId,
        fromOwner,
        toOwner,
        amount,
        transferType,
        price,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error transferring carbon credit on blockchain:', error);
      throw error;
    }
  }

  async retireCarbonCredit(creditId, ownerId, amount, retirementType, purpose) {
    try {
      await this.ensureInitialized();
      
      logger.info(`Retiring carbon credit: ${creditId} by ${ownerId}`);
      
      const result = await this.contract.submitTransaction(
        'RetireCredit',
        creditId,
        ownerId,
        amount.toString(),
        retirementType,
        purpose
      );
      
      const response = JSON.parse(result.toString());
      logger.info(`Carbon credit retired successfully: ${creditId}`);
      
      return {
        success: true,
        transactionHash: result.toString(),
        creditId,
        ownerId,
        amount,
        retirementType,
        purpose,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error retiring carbon credit on blockchain:', error);
      throw error;
    }
  }

  async getCarbonCredit(creditId) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('ReadCredit', creditId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting carbon credit:', error);
      throw error;
    }
  }

  async getAllCarbonCredits() {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetAllCredits');
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting all carbon credits:', error);
      throw error;
    }
  }

  async getCarbonCreditsByOwner(ownerId) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetCreditsByOwner', ownerId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting carbon credits by owner:', error);
      throw error;
    }
  }

  async getCarbonCreditsByProject(projectId) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetCreditsByProject', projectId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting carbon credits by project:', error);
      throw error;
    }
  }

  async getCarbonCreditsByStatus(status) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetCreditsByStatus', status);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting carbon credits by status:', error);
      throw error;
    }
  }

  async getCarbonCreditHistory(creditId) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetCreditHistory', creditId);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting carbon credit history:', error);
      throw error;
    }
  }

  async getTotalCreditsByType(creditType) {
    try {
      await this.ensureInitialized();
      
      const result = await this.contract.evaluateTransaction('GetTotalCreditsByType', creditType);
      return JSON.parse(result.toString());
    } catch (error) {
      logger.error('Error getting total credits by type:', error);
      throw error;
    }
  }

  async updateCreditStatus(creditId, status, metadata = null) {
    try {
      await this.ensureInitialized();
      
      logger.info(`Updating credit status: ${creditId} to ${status}`);
      
      const result = await this.contract.submitTransaction(
        'UpdateCredit',
        creditId,
        status,
        metadata ? JSON.stringify(metadata) : '{}'
      );
      
      const response = JSON.parse(result.toString());
      logger.info(`Credit status updated successfully: ${creditId}`);
      
      return response;
    } catch (error) {
      logger.error('Error updating credit status:', error);
      throw error;
    }
  }

  async isServiceAvailable() {
    return this.isInitialized;
  }

  async disconnect() {
    try {
      if (this.gateway && this.isInitialized) {
        await this.gateway.disconnect();
        this.isInitialized = false;
        logger.info('Blockchain service disconnected');
      }
    } catch (error) {
      logger.error('Failed to disconnect blockchain service:', error);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = {
  blockchainService
};
