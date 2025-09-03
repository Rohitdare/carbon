#!/bin/bash

# Blue Carbon MRV Chaincode Test Script
# This script tests the carbon credits chaincode functionality

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

# Test chaincode functions
test_chaincode() {
    print_status "Testing Carbon Credits Chaincode..."
    
    # Test 1: Create a new carbon credit
    print_status "Test 1: Creating a new carbon credit..."
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -c '{"Args":["CreateCredit","credit-test-001","project-001","ngo-001","50.0","mangrove","verify-001","mrv-001"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to create carbon credit."
        exit 1
    fi
    print_success "Carbon credit created successfully."
    
    # Test 2: Issue the credit
    print_status "Test 2: Issuing the carbon credit..."
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -c '{"Args":["IssueCredit","credit-test-001"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to issue carbon credit."
        exit 1
    fi
    print_success "Carbon credit issued successfully."
    
    # Test 3: Read the credit
    print_status "Test 3: Reading the carbon credit..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["ReadCredit","credit-test-001"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to read carbon credit."
        exit 1
    fi
    print_success "Carbon credit read successfully."
    
    # Test 4: Transfer the credit
    print_status "Test 4: Transferring the carbon credit..."
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -c '{"Args":["TransferCredit","credit-test-001","ngo-001","buyer-001","25.0","sale","100.0"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to transfer carbon credit."
        exit 1
    fi
    print_success "Carbon credit transferred successfully."
    
    # Test 5: Retire the credit
    print_status "Test 5: Retiring the carbon credit..."
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 -C carbon-credits-channel -n carbon-credits -c '{"Args":["RetireCredit","credit-test-001","buyer-001","25.0","voluntary","Climate action"]}' --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    if [ $? -ne 0 ]; then
        print_error "Failed to retire carbon credit."
        exit 1
    fi
    print_success "Carbon credit retired successfully."
    
    # Test 6: Query all credits
    print_status "Test 6: Querying all carbon credits..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetAllCredits"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to query all credits."
        exit 1
    fi
    print_success "All credits queried successfully."
    
    # Test 7: Query credits by owner
    print_status "Test 7: Querying credits by owner..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditsByOwner","ngo-001"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to query credits by owner."
        exit 1
    fi
    print_success "Credits by owner queried successfully."
    
    # Test 8: Query credits by status
    print_status "Test 8: Querying credits by status..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditsByStatus","issued"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to query credits by status."
        exit 1
    fi
    print_success "Credits by status queried successfully."
    
    # Test 9: Get credit history
    print_status "Test 9: Getting credit history..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetCreditHistory","credit-test-001"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get credit history."
        exit 1
    fi
    print_success "Credit history retrieved successfully."
    
    # Test 10: Get total credits by type
    print_status "Test 10: Getting total credits by type..."
    docker exec cli peer chaincode query -C carbon-credits-channel -n carbon-credits -c '{"Args":["GetTotalCreditsByType","mangrove"]}'
    
    if [ $? -ne 0 ]; then
        print_error "Failed to get total credits by type."
        exit 1
    fi
    print_success "Total credits by type retrieved successfully."
    
    print_success "All chaincode tests completed successfully!"
}

# Main execution
main() {
    print_status "Starting Carbon Credits Chaincode Tests..."
    
    test_chaincode
    
    print_success "Carbon Credits Chaincode testing completed successfully!"
    print_status "All functionality is working as expected."
}

# Run main function
main "$@"

