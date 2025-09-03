# Blue Carbon MRV Blockchain Service Dockerfile
FROM hyperledger/fabric-tools:2.5

# Set working directory
WORKDIR /opt/gopath/src/github.com/hyperledger/fabric/peer

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    vim \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Copy network configuration
COPY network-config/ /opt/gopath/src/github.com/hyperledger/fabric/peer/network-config/
COPY chaincode/ /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/
COPY scripts/ /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/

# Make scripts executable
RUN chmod +x /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/*.sh

# Set environment variables
ENV FABRIC_LOGGING_SPEC=INFO
ENV CORE_PEER_TLS_ENABLED=true
ENV CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt

# Expose ports
EXPOSE 7050 7051 8051 9051 10051 11051 12051

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD peer node status || exit 1

# Default command
CMD ["peer", "node", "start"]

