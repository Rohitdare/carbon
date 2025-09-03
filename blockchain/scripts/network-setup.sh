#!/bin/bash

# Blue Carbon MRV Blockchain Network Setup Script
# This script sets up a Hyperledger Fabric network for carbon credit management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v cryptogen &> /dev/null; then
        print_error "cryptogen is not installed. Please install Hyperledger Fabric tools first."
        exit 1
    fi
    
    if ! command -v configtxgen &> /dev/null; then
        print_error "configtxgen is not installed. Please install Hyperledger Fabric tools first."
        exit 1
    fi
    
    print_success "All prerequisites are installed."
}

# Clean up previous network
cleanup() {
    print_status "Cleaning up previous network..."
    
    # Stop and remove containers
    docker-compose -f docker/docker-compose.yaml down --volumes --remove-orphans
    
    # Remove crypto material
    if [ -d "crypto-config" ]; then
        rm -rf crypto-config
    fi
    
    # Remove channel artifacts
    if [ -d "channel-artifacts" ]; then
        rm -rf channel-artifacts
    fi
    
    # Remove chaincode containers
    docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
    
    # Remove chaincode images
    docker rmi -f $(docker images | grep dev-peer | awk '{print $3}') 2>/dev/null || true
    
    print_success "Cleanup completed."
}

# Generate crypto material
generate_crypto() {
    print_status "Generating crypto material..."
    
    cryptogen generate --config=network-config/crypto-config.yaml --output="crypto-config"
    
    if [ $? -ne 0 ]; then
        print_error "Failed to generate crypto material."
        exit 1
    fi
    
    print_success "Crypto material generated successfully."
}

# Generate channel artifacts
generate_channel_artifacts() {
    print_status "Generating channel artifacts..."
    
    mkdir -p channel-artifacts
    
    # Generate genesis block
    configtxgen -profile CarbonCreditsGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block -configPath network-config/
    
    if [ $? -ne 0 ]; then
        print_error "Failed to generate genesis block."
        exit 1
    fi
    
    # Generate channel configuration transaction
    configtxgen -profile CarbonCreditsChannel -outputCreateChannelTx ./channel-artifacts/carbon-credits-channel.tx -channelID carbon-credits-channel -configPath network-config/
    
    if [ $? -ne 0 ]; then
        print_error "Failed to generate channel configuration transaction."
        exit 1
    fi
    
    # Generate anchor peer transactions
    configtxgen -profile CarbonCreditsChannel -outputAnchorPeersUpdate ./channel-artifacts/GovernmentMSPanchors.tx -channelID carbon-credits-channel -asOrg GovernmentMSP -configPath network-config/
    configtxgen -profile CarbonCreditsChannel -outputAnchorPeersUpdate ./channel-artifacts/NGOMSPanchors.tx -channelID carbon-credits-channel -asOrg NGOMSP -configPath network-config/
    configtxgen -profile CarbonCreditsChannel -outputAnchorPeersUpdate ./channel-artifacts/VerifierMSPanchors.tx -channelID carbon-credits-channel -asOrg VerifierMSP -configPath network-config/
    
    if [ $? -ne 0 ]; then
        print_error "Failed to generate anchor peer transactions."
        exit 1
    fi
    
    print_success "Channel artifacts generated successfully."
}

# Start the network
start_network() {
    print_status "Starting the network..."
    
    docker-compose -f docker/docker-compose.yaml up -d
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start the network."
        exit 1
    fi
    
    # Wait for network to be ready
    print_status "Waiting for network to be ready..."
    sleep 10
    
    print_success "Network started successfully."
}

# Create and join channel
create_and_join_channel() {
    print_status "Creating and joining channel..."
    
    # Create channel
    docker exec cli peer channel create -o orderer.example.com:7050 -c carbon-credits-channel -f ./channel-artifacts/carbon-credits-channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to create channel."
        exit 1
    fi
    
    # Join Government peer to channel
    docker exec cli peer channel join -b carbon-credits-channel.block
    
    if [ $? -ne 0 ]; then
        print_error "Failed to join Government peer to channel."
        exit 1
    fi
    
    # Update anchor peers
    docker exec cli peer channel update -o orderer.example.com:7050 -c carbon-credits-channel -f ./channel-artifacts/GovernmentMSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to update Government anchor peers."
        exit 1
    fi
    
    print_success "Channel created and joined successfully."
}

# Install and instantiate chaincode
install_chaincode() {
    print_status "Installing and instantiating chaincode..."
    
    # Install chaincode on Government peer
    docker exec cli peer chaincode install -n carbon-credits -v 1.0 -p github.com/hyperledger/fabric/peer/chaincode/carbon-credits
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install chaincode on Government peer."
        exit 1
    fi
    
    # Instantiate chaincode
    docker exec cli peer chaincode instantiate -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -v 1.0 -c '{"Args":["init"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to instantiate chaincode."
        exit 1
    fi
    
    print_success "Chaincode installed and instantiated successfully."
}

# Test the network
test_network() {
    print_status "Testing the network..."
    
    # Initialize ledger
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -c '{"Args":["InitLedger"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to initialize ledger."
        exit 1
    fi
    
    # Query all credits
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetAllCredits"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to query credits."
        exit 1
    fi
    
    print_success "Network test completed successfully."
}

# Main execution
main() {
    print_status "Starting Blue Carbon MRV Blockchain Network Setup..."
    
    check_prerequisites
    cleanup
    generate_crypto
    generate_channel_artifacts
    start_network
    create_and_join_channel
    install_chaincode
    test_network
    
    print_success "Blue Carbon MRV Blockchain Network setup completed successfully!"
    print_status "Network is ready for carbon credit management."
    print_status "You can now interact with the network using the CLI container."
}

# Run main function
main "$@"

