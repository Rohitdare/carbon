# Blue Carbon MRV Blockchain Integration

This directory contains the Hyperledger Fabric blockchain integration for the Blue Carbon MRV platform. It implements a permissioned blockchain network with smart contracts for carbon credit management, verification, and trading.

## Overview

The blockchain integration provides:

- **Permissioned Network**: Government, NGO, and Verifier organizations
- **Smart Contracts**: Carbon credit lifecycle management
- **Immutable Records**: All transactions are permanently recorded
- **Transparency**: Public audit trail for all carbon credit operations
- **Security**: Cryptographic verification of all transactions

## Architecture

### Network Organizations

1. **Government Organization (GovernmentMSP)**
   - Issues and verifies carbon credits
   - Manages regulatory compliance
   - Oversees the network

2. **NGO Organization (NGOMSP)**
   - Creates and manages projects
   - Submits MRV reports
   - Owns and trades carbon credits

3. **Verifier Organization (VerifierMSP)**
   - Verifies MRV reports
   - Validates carbon credit claims
   - Provides third-party verification

### Smart Contract Features

The `carbon-credits` chaincode provides:

- **Credit Creation**: Create new carbon credits from verified projects
- **Credit Issuance**: Issue credits after verification
- **Credit Transfer**: Transfer ownership between parties
- **Credit Retirement**: Permanently retire credits
- **Credit History**: Complete audit trail
- **Query Functions**: Various query capabilities

## Prerequisites

- Docker and Docker Compose
- Hyperledger Fabric tools (cryptogen, configtxgen)
- Go 1.21+ (for chaincode development)
- Node.js 18+ (for client applications)

## Quick Start

### 1. Setup the Network

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Setup the entire network
npm run setup
```

This will:
- Generate crypto material
- Create channel artifacts
- Start the network
- Create and join channels
- Install and instantiate chaincode

### 2. Test the Network

```bash
# Run comprehensive tests
npm run test
```

### 3. Interact with the Network

```bash
# Start the network
npm run start

# View logs
npm run logs

# Stop the network
npm run stop
```

### 4. Cleanup

```bash
# Teardown the network
npm run teardown
```

## Network Configuration

### Crypto Configuration

The `network-config/crypto-config.yaml` defines:
- Orderer organization
- Peer organizations (Government, NGO, Verifier)
- Certificate authorities
- User accounts

### Channel Configuration

The `network-config/configtx.yaml` defines:
- Network topology
- Channel policies
- Organization policies
- Capabilities

## Smart Contract API

### Carbon Credit Operations

#### Create Credit
```bash
peer chaincode invoke -C carbon-credits-channel -n carbon-credits -c '{"Args":["CreateCredit","credit-id","project-id","owner-id","amount","type","verification-id","mrv-report-id"]}'
```

#### Issue Credit
```bash
peer chaincode invoke -C carbon-credits-channel -n carbon-credits -c '{"Args":["IssueCredit","credit-id"]}'
```

#### Transfer Credit
```bash
peer chaincode invoke -C carbon-credits-channel -n carbon-credits -c '{"Args":["TransferCredit","credit-id","from-owner","to-owner","amount","transfer-type","price"]}'
```

#### Retire Credit
```bash
peer chaincode invoke -C carbon-credits-channel -n carbon-credits -c '{"Args":["RetireCredit","credit-id","owner-id","amount","retirement-type","purpose"]}'
```

### Query Operations

#### Read Credit
```bash
peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["ReadCredit","credit-id"]}'
```

#### Get All Credits
```bash
peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetAllCredits"]}'
```

#### Get Credits by Owner
```bash
peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditsByOwner","owner-id"]}'
```

#### Get Credits by Status
```bash
peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditsByStatus","status"]}'
```

#### Get Credit History
```bash
peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditHistory","credit-id"]}'
```

## Data Models

### CarbonCredit
```go
type CarbonCredit struct {
    ID              string    `json:"id"`
    ProjectID       string    `json:"projectId"`
    OwnerID         string    `json:"ownerId"`
    Amount          float64   `json:"amount"`
    Type            string    `json:"type"`
    Status          string    `json:"status"`
    IssuedDate      time.Time `json:"issuedDate"`
    ExpiryDate      time.Time `json:"expiryDate"`
    VerificationID  string    `json:"verificationId"`
    MRVReportID     string    `json:"mrvReportId"`
    BlockchainHash  string    `json:"blockchainHash"`
    Metadata        map[string]interface{} `json:"metadata"`
    CreatedAt       time.Time `json:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt"`
}
```

### CreditTransfer
```go
type CreditTransfer struct {
    ID              string    `json:"id"`
    FromOwnerID     string    `json:"fromOwnerId"`
    ToOwnerID       string    `json:"toOwnerId"`
    CreditID        string    `json:"creditId"`
    Amount          float64   `json:"amount"`
    TransferType    string    `json:"transferType"`
    Price           float64   `json:"price,omitempty"`
    TransactionHash string    `json:"transactionHash"`
    Status          string    `json:"status"`
    CreatedAt       time.Time `json:"createdAt"`
    CompletedAt     *time.Time `json:"completedAt,omitempty"`
}
```

### CreditRetirement
```go
type CreditRetirement struct {
    ID              string    `json:"id"`
    CreditID        string    `json:"creditId"`
    OwnerID         string    `json:"ownerId"`
    Amount          float64   `json:"amount"`
    RetirementType  string    `json:"retirementType"`
    Purpose         string    `json:"purpose"`
    CertificateURL  string    `json:"certificateUrl,omitempty"`
    RetirementDate  time.Time `json:"retirementDate"`
    CreatedAt       time.Time `json:"createdAt"`
}
```

## Security Features

### Access Control
- Role-based access control (RBAC)
- Organization-based permissions
- Transaction-level authorization

### Data Integrity
- Cryptographic hashing
- Digital signatures
- Immutable ledger

### Privacy
- Private data collections
- Encrypted transactions
- Confidentiality controls

## Integration with Backend

The blockchain service integrates with the Node.js backend through:

1. **Blockchain Service**: `backend/src/services/blockchainService.js`
2. **API Endpoints**: `/api/blockchain/*`
3. **Event Listeners**: Real-time blockchain events
4. **Data Synchronization**: Sync between database and blockchain

## Monitoring and Logging

### Network Monitoring
- Peer status monitoring
- Channel health checks
- Transaction throughput metrics

### Logging
- Comprehensive transaction logs
- Error tracking and reporting
- Performance metrics

## Development

### Adding New Features

1. **Modify Chaincode**: Update `chaincode/carbon-credits.go`
2. **Update Tests**: Add tests in `scripts/test-chaincode.sh`
3. **Update Documentation**: Update this README

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
./scripts/test-chaincode.sh

# Run network tests
./scripts/network-setup.sh
```

## Troubleshooting

### Common Issues

1. **Network Startup Issues**
   - Check Docker daemon is running
   - Verify port availability
   - Check crypto material generation

2. **Chaincode Issues**
   - Verify Go version compatibility
   - Check chaincode compilation
   - Review transaction logs

3. **Channel Issues**
   - Verify channel configuration
   - Check organization policies
   - Review anchor peer configuration

### Debug Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs <container-name>

# Check network status
docker network ls

# View chaincode logs
docker logs dev-peer0.government.example.com-carbon-credits-1.0
```

## Production Deployment

### Security Considerations

1. **Network Security**
   - Use production-grade certificates
   - Implement network segmentation
   - Enable TLS encryption

2. **Access Control**
   - Implement strong authentication
   - Use hardware security modules
   - Regular security audits

3. **Backup and Recovery**
   - Regular ledger backups
   - Disaster recovery procedures
   - Data retention policies

### Performance Optimization

1. **Network Performance**
   - Optimize batch sizes
   - Tune consensus parameters
   - Monitor resource usage

2. **Chaincode Performance**
   - Optimize query patterns
   - Implement caching
   - Use private data collections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

