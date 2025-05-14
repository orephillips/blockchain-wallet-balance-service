# Multi Blockchain Wallet Balance Service - Developer Guide

This document provides a comprehensive explanation of the Multi Blockchain Wallet Balance Service codebase for AI assistants like Windsurf to understand the architecture, implementation details, and nuances.

## Project Overview

The Multi Blockchain Wallet Balance Service is a comprehensive API service that fetches wallet balances from 40+ different blockchain networks. It replaces mock data with real API calls to provide accurate and up-to-date blockchain wallet balances.

### Key Features

- Support for 40+ blockchain networks including Ethereum, Bitcoin, Cosmos ecosystem, and more
- Real-time balance fetching using native blockchain APIs
- Token balance retrieval for supported networks
- Unified response format across all blockchain networks
- Browser-based testing interface

## Architecture

The project follows a modular architecture with the following components:

### 1. Core Server (`multi-blockchain-server.js`)

This is the main Express.js server that handles API requests and routes them to the appropriate blockchain handlers. It includes:

- CORS configuration for cross-origin requests
- API key management through environment variables
- Sample address management for testing
- Handler registry for all blockchain networks

### 2. Blockchain Handlers

Each blockchain network has a dedicated handler function that:
- Constructs the appropriate API URL
- Makes the API request
- Parses the response
- Formats the data into a standardized response format

### 3. Testing Interface (`public/multi-blockchain-test.html`)

A browser-based interface for testing the API endpoints with:
- Dropdown selection for blockchain networks
- Pre-filled sample addresses
- Balance type selection (Native/Token)
- JSON response display

## Implementation Details

### API Response Format

All blockchain handlers return data in a standardized format:

```javascript
{
  success: true,
  data: {
    Ticker: 'ETH', // Blockchain native token ticker
    Amount: '1.234', // Balance amount as string
    WalletId: 'bitwave-wallet-id-{address}', // Internal wallet ID
    RemoteWalletId: '{address}', // Blockchain address
    BlockId: '0', // Block number (if available)
    TimestampSEC: '{timestamp}', // Current timestamp in seconds
    RawMetadata: {
      source: '{API Provider}', // Source of the data
      chain: '{Blockchain Name}', // Name of the blockchain
      raw_response: {response} // Original API response
    }
  }
}
```

### Blockchain Network Categories

The service organizes blockchain networks into several categories:

1. **EVM Chains** - Using Etherscan-like APIs:
   - Ethereum, Arbitrum, Polygon, BSC, Fantom, Optimism, Base
   - All use similar API patterns with different base URLs and API keys

2. **Bitcoin & Derivatives**:
   - Bitcoin (Blockchain.info API)
   - Litecoin (BlockCypher API)

3. **Cosmos Ecosystem**:
   - Evmos, Umee, Kyve, Persistence, Axelar, Celestia, Kava, Agoric, Akash, Regen, Provenance, Osmosis
   - All use the Cosmos REST API pattern

4. **Other Blockchains**:
   - Hedera, Stellar, Filecoin, Deso, SUI, Arweave, Aurora, Cardano, Kusama, Near, Stacks, Polkadot

### API Key Management

API keys are stored in environment variables and accessed through the `API_KEYS` object:

```javascript
const API_KEYS = {
  etherscan: process.env.ETHERSCAN_API_KEY || '',
  arbiscan: process.env.ARBISCAN_API_KEY || '',
  polyscan: process.env.POLYSCAN_API_KEY || '',
  // ... other API keys
};
```

### CORS Configuration

The server uses CORS configuration to handle cross-origin requests:

```javascript
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials
}));
```

This configuration is essential for browser-based applications to communicate with the API server.

## Handler Implementation Patterns

### EVM Chain Handler Pattern

```javascript
async function etherscanHandler(chain, address, endpoint) {
  try {
    const apiKey = API_KEYS[chain] || '';
    let baseUrl = '';
    
    // Select the appropriate base URL based on the chain
    switch(chain) {
      case 'ethereum':
        baseUrl = 'https://api.etherscan.io/api';
        break;
      case 'arbitrum':
        baseUrl = 'https://api.arbiscan.io/api';
        break;
      // ... other chains
    }
    
    // Construct the API URL based on the endpoint
    let url = '';
    if (endpoint === 'native') {
      url = `${baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
    } else if (endpoint === 'tokens') {
      // Token balance endpoint
    }
    
    // Make the API request
    const response = await axios.get(url);
    
    // Parse and format the response
    if (response.data.status !== '1') {
      throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
    }
    
    const balanceInWei = response.data.result;
    const balanceInEth = (parseInt(balanceInWei) / Math.pow(10, 18)).toString();
    
    // Return the standardized response
    return {
      success: true,
      data: {
        Ticker: 'ETH', // Varies by chain
        Amount: balanceInEth,
        WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
        RemoteWalletId: address,
        BlockId: '0',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Etherscan API',
          chain: 'Ethereum', // Varies by chain
          raw_response: response.data
        }
      }
    };
  } catch (error) {
    // Error handling
    return {
      success: false,
      errors: [error.message]
    };
  }
}
```

### Cosmos Chain Handler Pattern

```javascript
async function cosmosHandler(chain, address, endpoint) {
  try {
    // Construct the API URL based on the chain
    const baseUrl = `https://rest.cosmos.directory/${chain}/cosmos/bank/v1beta1/balances/${address}`;
    
    // Make the API request
    const response = await axios.get(baseUrl);
    
    // Parse and format the response
    if (!response.data || !response.data.balances) {
      throw new Error('Invalid response from Cosmos API');
    }
    
    const balances = response.data.balances;
    let amount = '0';
    let ticker = chain.toUpperCase();
    
    if (balances.length > 0) {
      amount = balances[0].amount;
      ticker = balances[0].denom;
    }
    
    // Return the standardized response
    return {
      success: true,
      data: {
        Ticker: ticker,
        Amount: amount,
        WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
        RemoteWalletId: address,
        BlockId: '0',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Cosmos REST API',
          chain: chain,
          raw_response: response.data
        }
      }
    };
  } catch (error) {
    // Error handling
    return {
      success: false,
      errors: [error.message]
    };
  }
}
```

## API Endpoints

The server exposes the following API endpoints:

1. **Native Balance**: `/api/v1/chains/:chainId/addresses/:address/native-balance`
   - Fetches the native token balance for the specified blockchain and address

2. **Token Balances**: `/api/v1/chains/:chainId/addresses/:address/token-balances`
   - Fetches token balances for the specified blockchain and address (where supported)

3. **All Balances**: `/api/v1/chains/:chainId/addresses/:address/balances`
   - Fetches both native and token balances for the specified blockchain and address

## Running the Service

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd blockchain-wallet-balance-service/backend
   npm install
   ```

3. Create a `.env` file with API keys:
   ```
   PORT=3005
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ARBISCAN_API_KEY=your_arbiscan_api_key
   # ... other API keys
   ```

4. Start the server:
   ```
   node multi-blockchain-server.js
   ```

5. Access the testing interface at `http://localhost:3005/`

## Common Issues and Solutions

### CORS Issues

If you encounter CORS issues when making requests from a browser, ensure the CORS configuration in `multi-blockchain-server.js` is properly set up:

```javascript
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials
}));
```

For production, you may want to restrict the `origin` to specific domains.

### API Rate Limiting

Many blockchain APIs have rate limits. If you encounter rate limiting issues, consider:

1. Implementing caching for responses
2. Adding retry logic with exponential backoff
3. Using multiple API keys and rotating between them

### Error Handling

The service includes robust error handling for API requests. If you need to extend error handling, look at the try/catch blocks in each handler function.

## Docker Deployment

The service can be deployed using Docker. Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3005

CMD ["node", "multi-blockchain-server.js"]
```

Build and run the Docker image:

```
docker build -t multi-blockchain-service .
docker run -p 3005:3005 multi-blockchain-service
```

## Conclusion

The Multi Blockchain Wallet Balance Service provides a unified API for fetching wallet balances from 40+ blockchain networks. It uses real API calls to provide accurate and up-to-date information, with a standardized response format across all networks.

The modular architecture makes it easy to add support for new blockchain networks by implementing new handler functions following the established patterns.
