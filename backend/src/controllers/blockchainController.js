const { blockchainService } = require('../services/blockchainService');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * @swagger
 * /api/v1/blockchain/credits/{creditId}/history:
 *   get:
 *     summary: Get carbon credit transaction history
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creditId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carbon credit history retrieved successfully
 */
const getCarbonCreditHistory = async (req, res) => {
  try {
    const { creditId } = req.params;

    const result = await blockchainService.getCarbonCreditHistory(creditId);

    res.json({
      success: true,
      message: 'Carbon credit history retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error getting carbon credit history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve carbon credit history'
    });
  }
};

/**
 * @swagger
 * /api/v1/blockchain/credits/{creditId}/verify:
 *   get:
 *     summary: Verify carbon credit on blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creditId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carbon credit verification completed
 */
const verifyCarbonCredit = async (req, res) => {
  try {
    const { creditId } = req.params;

    const result = await blockchainService.verifyCarbonCredit(creditId);

    res.json({
      success: true,
      message: 'Carbon credit verification completed',
      data: result
    });
  } catch (error) {
    logger.error('Error verifying carbon credit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify carbon credit'
    });
  }
};

/**
 * @swagger
 * /api/v1/blockchain/network/status:
 *   get:
 *     summary: Get blockchain network status
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Network status retrieved successfully
 */
const getNetworkStatus = async (req, res) => {
  try {
    // This would typically check the blockchain network health
    const networkStatus = {
      status: 'connected',
      networkName: process.env.BLOCKCHAIN_CHANNEL_NAME || 'bluecarbonchannel',
      chaincodeName: process.env.BLOCKCHAIN_CHAINCODE_NAME || 'bluecarboncc',
      organization: process.env.BLOCKCHAIN_ORG_MSP_ID || 'Org1MSP',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Network status retrieved successfully',
      data: networkStatus
    });
  } catch (error) {
    logger.error('Error getting network status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve network status'
    });
  }
};

module.exports = {
  getCarbonCreditHistory,
  verifyCarbonCredit,
  getNetworkStatus
};

