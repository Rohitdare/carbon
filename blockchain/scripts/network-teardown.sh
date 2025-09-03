#!/bin/bash

# Blue Carbon MRV Blockchain Network Teardown Script
# This script tears down the Hyperledger Fabric network

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

# Stop and remove containers
stop_containers() {
    print_status "Stopping and removing containers..."
    
    docker-compose -f docker/docker-compose.yaml down --volumes --remove-orphans
    
    if [ $? -ne 0 ]; then
        print_error "Failed to stop containers."
        exit 1
    fi
    
    print_success "Containers stopped and removed successfully."
}

# Remove chaincode containers and images
cleanup_chaincode() {
    print_status "Cleaning up chaincode containers and images..."
    
    # Remove chaincode containers
    docker rm -f $(docker ps -aq --filter "name=dev-peer") 2>/dev/null || true
    
    # Remove chaincode images
    docker rmi -f $(docker images | grep dev-peer | awk '{print $3}') 2>/dev/null || true
    
    print_success "Chaincode cleanup completed."
}

# Remove crypto material and channel artifacts
cleanup_artifacts() {
    print_status "Cleaning up crypto material and channel artifacts..."
    
    # Remove crypto material
    if [ -d "crypto-config" ]; then
        rm -rf crypto-config
        print_success "Crypto material removed."
    fi
    
    # Remove channel artifacts
    if [ -d "channel-artifacts" ]; then
        rm -rf channel-artifacts
        print_success "Channel artifacts removed."
    fi
    
    print_success "Artifacts cleanup completed."
}

# Remove Docker volumes
cleanup_volumes() {
    print_status "Cleaning up Docker volumes..."
    
    # Remove specific volumes
    docker volume rm -f $(docker volume ls -q | grep -E "(orderer|peer)") 2>/dev/null || true
    
    print_success "Docker volumes cleanup completed."
}

# Main execution
main() {
    print_status "Starting Blue Carbon MRV Blockchain Network Teardown..."
    
    stop_containers
    cleanup_chaincode
    cleanup_artifacts
    cleanup_volumes
    
    print_success "Blue Carbon MRV Blockchain Network teardown completed successfully!"
    print_status "All network components have been removed."
}

# Run main function
main "$@"

