const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = 3005;

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true // Allow credentials
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

let apiKeys = [];
try {
  const apiKeysPath = path.join(__dirname, 'api-keys.json');
  if (fs.existsSync(apiKeysPath)) {
    apiKeys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf8'));
    console.log(`Loaded ${apiKeys.length} API keys`);
  } else {
    console.warn('API keys file not found. Authentication will not work.');
  }
} catch (error) {
  console.error('Error loading API keys:', error);
}

function authenticateApiKey(req, res, next) {
  if (req.path === '/login.html' || req.path === '/api/auth/verify') {
    return next();
  }
  
  const apiKey = req.query.apiKey || req.headers['x-api-key'] || req.cookies?.apiKey;
  
  if (apiKey === 'BITWAVETRIAL') {
    if (req.path.includes('/chains/') && !req.path.includes('/chains/ethereum/')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Trial API key only allows access to Ethereum network. Please contact solutions@bitwave.io for full access.' 
      });
    }
    return next();
  }
  
  if (!apiKey || !apiKeys.includes(apiKey)) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/');
    }
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  
  next();
}

app.use(authenticateApiKey);

const API_KEYS = {
  etherscan: process.env.ETHERSCAN_API_KEY || '',
  arbiscan: process.env.ARBISCAN_API_KEY || '',
  polyscan: process.env.POLYSCAN_API_KEY || '',
  bscscan: process.env.BSCSCAN_API_KEY || '',
  fantom: process.env.FANTOM_API_KEY || '',
  optimism: process.env.OPTIMISM_API_KEY || '',
  base: process.env.BASE_API_KEY || '',
  cardano: process.env.CARDANO_API_KEY || '',
  stacks: process.env.STACKS_API_KEY || ''
};

const SAMPLE_ADDRESSES = {
  ethereum: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
  arbitrum: '0x011d9F2381Ce5073e9A4e57B685F485C7D76B8B3',
  polygon: '0x55cb29CF8cBD2194D96F7f6B967C0b14adAfcD17',
  bsc: '0x75B851a27D7101438F45fce31816501193239A83',
  fantom: '0x8E1701CFd85258DDb8DFE89Bc4c7350822B9601D',
  optimism: '0xAE0b5DF2dFaaCD6EB6c1c56Cc710f529F31C6C44',
  base: '0xD379F3d4578DE7aC47a5928811B3407Ef03F7C49',
  gnosis: '0x7Ad205683e9aA9FCB42fC996c9B91b94D9054BB7',
  hedera: '0.0.400',
  litecoin: 'LcNS6c8RddAMjewDrUAAi8BzecKoosnkN3',
  stellar: 'GDUY7J7A33TQWOSOQGDO776GGLM3UQERL4J3SPT56F6YS4ID7MLDERI4',
  bitcoin: 'bc1qgcfsthv6dx94a7uqq9prtqxpdd0udcfr6uwrg3',
  celo: '0x87Ccdf47726Bf2D714BEf95820811df138e19Cc4',
  evmos: 'evmos1yt46fjxv5dac5wmtkxxxj42d94h8nav4sd2s6f',
  umee: 'umee1u5fnrzss6ffcde4jsqqcr4qyv783e4lg0kjl3k',
  kyve: 'kyve1hae0u8jqfedpm7u5ng6k464xsxx32tvluqus8t',
  persistence: 'persistence1cwv9qc04nhuev2kgypltlpq6x2mjutf43qtpuq',
  axelar: 'axelar1rd7le6pc7hjj0x6mly3d3mn99nuvrrkpqe4pzc',
  celestia: 'celestia14u95n7y5epwfk2fmzrx9ves8rmpw539fx6f4sh',
  kava: 'kava1ceun2qqw65qce5la33j8zv8ltyyaqqfcxftutz',
  agoric: 'agoric18tl9ph67ptsxwk477qpcqzr7enjtehew2z6jaf',
  akash: 'akash1uepjmgfuk6rnd0djsglu88w7d0t49lml6zc0vr',
  regen: 'regen1t8p3zdu3h8qzggfmvvvmtdnaj4trcsfhzzmydg',
  provenance: 'pb10lkmc6kvym23ykylgzpghalgwnw33w0c0shvxp',
  osmosis: 'osmo1tf7wjthwt9mgywqvjdkj974rp5awzzm4t695gx',
  filecoin: 'f1nfwi4ieqom5l2ck2fkl6aumwiotklsf4utht6by',
  deso: 'BC1YLg38KgfyDfuUd9NkjrGuuMjBUWth3CbaKygp3XEjov8ZyUUKqTV',
  sui: '0xea0e3284dd4069836f66697c5ac479e901c748f63f7910384d44a05ec68fa862',
  arweave: 'mCNkDI6yWxaibA_niptby5p7h4qWuZHVF-LFm6c42SY',
  aurora: '0xabCB669237c9D2bf0F595B701260ee528a149Cdb',
  cardano: 'addr1qye4kkmle50f3k6tqt6alrgtv4ddk3u',
  kusama: 'EM9jxKiiB4vU1C66Wg7MzFxNXJmY4mPgpPVafK1Kjw8FHyj',
  near: 'treasury.near',
  polkadot: '13Z7KjGnzdAdMre9cqRwTZHR6F2p36gqBsaNmQwwosiPz8JT',
  stacks: 'SM18F50N7QBHQ9CAMPRJAMG9DYQC1DVB7D22RFR3D',
  blast: '0x95925601eAFc0C89Cf39868bd49662b6015b5c72',
  avalanche_c: '0x7A2DFE8B1C0F221F220D8D42A0d5CB54671B18F4',
};

const handlers = {
  async etherscanHandler(req, res, chain) {
    try {
      const { address } = req.params;
      const { type, contractaddress } = req.query;
      
      let url = '';
      let apiKey = '';
      let baseUrl = '';
      let ticker = '';
      
      switch(chain) {
        case 'ethereum':
          apiKey = API_KEYS.etherscan;
          baseUrl = 'https://api.etherscan.io/api';
          ticker = 'ETH';
          break;
        case 'arbitrum':
          apiKey = API_KEYS.arbiscan;
          baseUrl = 'https://api.arbiscan.io/api';
          ticker = 'ARB';
          break;
        case 'polygon':
          apiKey = API_KEYS.polyscan;
          baseUrl = 'https://api.polygonscan.com/api';
          ticker = 'MATIC';
          break;
        case 'bsc':
          apiKey = API_KEYS.bscscan;
          baseUrl = 'https://api.bscscan.com/api';
          ticker = 'BNB';
          break;
        case 'fantom':
          apiKey = API_KEYS.fantom;
          baseUrl = 'https://api.ftmscan.com/api';
          ticker = 'FTM';
          break;
        case 'optimism':
          apiKey = API_KEYS.optimism;
          baseUrl = 'https://api-optimistic.etherscan.io/api';
          ticker = 'ETH';
          break;
        case 'base':
          apiKey = API_KEYS.base;
          baseUrl = 'https://api.basescan.org/api';
          ticker = 'ETH';
          break;
        default:
          throw new Error('Unsupported chain');
      }
      
      if (type === 'token' && contractaddress) {
        url = `${baseUrl}?module=account&action=tokenbalance&contractaddress=${contractaddress}&address=${address}&tag=latest&apikey=${apiKey}`;
        ticker = 'TOKEN'; // This will be overridden if we can get token info
      } else {
        url = `${baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
      }
      
      const balanceInWei = response.data.result;
      const balanceInEth = (parseInt(balanceInWei) / Math.pow(10, 18)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: ticker,
          Amount: balanceInEth,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: `${chain.charAt(0).toUpperCase() + chain.slice(1)}scan API`,
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching ${chain} balance:`, error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async blockcypherHandler(req, res, chain = 'litecoin') {
    try {
      const { address } = req.params;
      let url = '';
      let ticker = '';
      
      if (chain === 'litecoin') {
        url = `https://api.blockcypher.com/v1/ltc/main/addrs/${address}`;
        ticker = 'LTC';
      } else if (chain === 'bitcoin') {
        url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}`;
        ticker = 'BTC';
      } else {
        throw new Error(`Unsupported chain for BlockCypher: ${chain}`);
      }
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.final_balance) {
        throw new Error('Invalid response from BlockCypher API');
      }
      
      const balanceInSatoshis = response.data.final_balance;
      const balanceInCoin = (balanceInSatoshis / 100000000).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: ticker,
          Amount: balanceInCoin,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: response.data.height || '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'BlockCypher API',
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching ${chain} balance:`, error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async blockscoutHandler(req, res, chain = 'gnosis') {
    try {
      const { address } = req.params;
      let url = '';
      let ticker = '';
      
      if (chain === 'gnosis') {
        url = `https://blockscout.com/xdai/mainnet/api?module=account&action=balance&address=${address}`;
        ticker = 'xDAI';
      } else if (chain === 'celo') {
        url = `https://explorer.celo.org/mainnet/api?module=account&action=balance&address=${address}`;
        ticker = 'CELO';
      } else if (chain === 'aurora') {
        url = `https://explorer.mainnet.aurora.dev/api?module=account&action=balance&address=${address}`;
        ticker = 'ETH';
      } else {
        throw new Error(`Unsupported chain for Blockscout: ${chain}`);
      }
      
      const response = await axios.get(url);
      
      if (!response.data || response.data.status !== '1') {
        throw new Error(`API Error: ${response.data?.message || 'Unknown error'}`);
      }
      
      const balanceInWei = response.data.result;
      const balanceInCoin = (parseInt(balanceInWei) / Math.pow(10, 18)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: ticker,
          Amount: balanceInCoin,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Blockscout API',
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching ${chain} balance:`, error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async avalancheHandler(req, res) {
    try {
      const { address } = req.params;
      const { type = 'native' } = req.query;
      
      // Avalanche C-Chain RPC endpoint
      const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
      
      if (type === 'token' && req.query.contractaddress) {
        // For token balances, we need to make an eth_call to the token contract
        const data = `0x70a08231000000000000000000000000${address.replace('0x', '')}`;
        
        const response = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: req.query.contractaddress,
              data: data
            },
            'latest'
          ]
        });
        
        if (!response.data || !response.data.result) {
          throw new Error('Invalid response from Avalanche RPC');
        }
        
        const balanceHex = response.data.result;
        const balanceInWei = parseInt(balanceHex, 16);
        const balanceInAvax = (balanceInWei / Math.pow(10, 18)).toString();
        
        res.status(200).json({
          success: true,
          data: {
            Ticker: 'TOKEN', // Generic token ticker
            Amount: balanceInAvax,
            WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
            RemoteWalletId: address,
            BlockId: '0',
            TimestampSEC: Math.floor(Date.now() / 1000).toString(),
            RawMetadata: {
              source: 'Avalanche C-Chain RPC',
              chain: 'Avalanche C-Chain',
              raw_response: response.data
            }
          }
        });
      } else {
        // For native AVAX balance
        const response = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        if (!response.data || !response.data.result) {
          throw new Error('Invalid response from Avalanche RPC');
        }
        
        const balanceHex = response.data.result;
        const balanceInWei = parseInt(balanceHex, 16);
        const balanceInAvax = (balanceInWei / Math.pow(10, 18)).toString();
        
        res.status(200).json({
          success: true,
          data: {
            Ticker: 'AVAX',
            Amount: balanceInAvax,
            WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
            RemoteWalletId: address,
            BlockId: '0',
            TimestampSEC: Math.floor(Date.now() / 1000).toString(),
            RawMetadata: {
              source: 'Avalanche C-Chain RPC',
              chain: 'Avalanche C-Chain',
              raw_response: response.data
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Avalanche C-Chain balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async blockchainInfoHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://blockchain.info/rawaddr/${address}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.final_balance) {
        throw new Error('Invalid response from Blockchain.info API');
      }
      
      const balanceInSatoshis = response.data.final_balance;
      const balanceInBtc = (balanceInSatoshis / 100000000).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'BTC',
          Amount: balanceInBtc,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: response.data.n_tx || '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Blockchain.info API',
            chain: 'Bitcoin',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async stellarHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://horizon.stellar.org/accounts/${address}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.balances) {
        throw new Error('Invalid response from Stellar API');
      }
      
      const xlmBalance = response.data.balances.find(b => b.asset_type === 'native') || { balance: '0' };
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'XLM',
          Amount: xlmBalance.balance,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Stellar Horizon API',
            chain: 'Stellar',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Stellar balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async hederaHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${address}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.balance) {
        throw new Error('Invalid response from Hedera API');
      }
      
      const balanceInHbar = (parseInt(response.data.balance.balance) / Math.pow(10, 8)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'HBAR',
          Amount: balanceInHbar,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Hedera Mirror Node API',
            chain: 'Hedera',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Hedera balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async cosmosHandler(req, res, chain) {
    try {
      const { address } = req.params;
      let url = '';
      let ticker = '';
      
      switch(chain) {
        case 'evmos':
          url = `https://rest.cosmos.directory/evmos/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'EVMOS';
          break;
        case 'umee':
          url = `https://rest.cosmos.directory/umee/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'UMEE';
          break;
        case 'kyve':
          url = `https://rest.cosmos.directory/kyve/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'KYVE';
          break;
        case 'persistence':
          url = `https://rest.cosmos.directory/persistence/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'XPRT';
          break;
        case 'axelar':
          url = `https://rest.cosmos.directory/axelar/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'AXL';
          break;
        case 'celestia':
          url = `https://rest.cosmos.directory/celestia/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'TIA';
          break;
        case 'kava':
          url = `https://rest.cosmos.directory/kava/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'KAVA';
          break;
        case 'agoric':
          url = `https://rest.cosmos.directory/agoric/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'BLD';
          break;
        case 'akash':
          url = `https://rest.cosmos.directory/akash/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'AKT';
          break;
        case 'regen':
          url = `https://rest.cosmos.directory/regen/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'REGEN';
          break;
        case 'provenance':
          url = `https://rest.cosmos.directory/provenance/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'HASH';
          break;
        case 'osmosis':
          url = `https://rest.cosmos.directory/osmosis/cosmos/bank/v1beta1/balances/${address}`;
          ticker = 'OSMO';
          break;
        default:
          throw new Error(`Unsupported Cosmos chain: ${chain}`);
      }
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.balances) {
        throw new Error(`Invalid response from ${chain} API`);
      }
      
      const nativeBalance = response.data.balances.find(b => b.denom.startsWith('u')) || { amount: '0', denom: `u${ticker.toLowerCase()}` };
      const balanceInToken = (parseInt(nativeBalance.amount) / Math.pow(10, 6)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: ticker,
          Amount: balanceInToken,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: `${chain.charAt(0).toUpperCase() + chain.slice(1)} API`,
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching ${chain} balance:`, error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async filecoinHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://filfox.info/api/v1/address/${address}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.balance) {
        throw new Error('Invalid response from Filecoin API');
      }
      
      const balanceInFil = (parseFloat(response.data.balance) / Math.pow(10, 18)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'FIL',
          Amount: balanceInFil,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Filfox API',
            chain: 'Filecoin',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Filecoin balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async desoHandler(req, res) {
    try {
      const { address } = req.params;
      const url = 'https://api.deso.org/api/v0/get-users-stateless';
      
      console.log('Fetching Deso balance for address:', address);
      
      const response = await axios.post(url, {
        PublicKeysBase58Check: [address],
        SkipForLeaderboard: true
      });
      
      console.log('Deso API response:', JSON.stringify(response.data));
      
      if (!response.data || !response.data.UserList || response.data.UserList.length === 0) {
        throw new Error('Invalid response from Deso API');
      }
      
      const user = response.data.UserList[0];
      const balanceInDeso = user.BalanceNanos ? (parseInt(user.BalanceNanos) / Math.pow(10, 9)).toString() : "0";
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'DESO',
          Amount: balanceInDeso,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Deso API',
            chain: 'Deso',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Deso balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async suiHandler(req, res) {
    try {
      const { address } = req.params;
      const url = 'https://fullnode.mainnet.sui.io:443';
      
      const response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getAllBalances',
        params: [address]
      });
      
      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from SUI API');
      }
      
      const suiBalance = response.data.result.find(b => b.coinType === '0x2::sui::SUI') || { totalBalance: '0' };
      const balanceInSui = (parseInt(suiBalance.totalBalance) / Math.pow(10, 9)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'SUI',
          Amount: balanceInSui,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'SUI API',
            chain: 'SUI',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching SUI balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async arweaveHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://arweave.net/wallet/${address}/balance`;
      
      const response = await axios.get(url);
      
      if (!response.data) {
        throw new Error('Invalid response from Arweave API');
      }
      
      const balanceInAr = (parseInt(response.data) / Math.pow(10, 12)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'AR',
          Amount: balanceInAr,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Arweave API',
            chain: 'Arweave',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Arweave balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async subscanHandler(req, res, chain) {
    try {
      const { address } = req.params;
      let url = '';
      let ticker = '';
      
      if (chain === 'kusama') {
        url = 'https://kusama.api.subscan.io/api/scan/account/balance_history';
        ticker = 'KSM';
      } else if (chain === 'polkadot') {
        url = 'https://polkadot.api.subscan.io/api/scan/account/balance_history';
        ticker = 'DOT';
      } else {
        throw new Error(`Unsupported chain for Subscan: ${chain}`);
      }
      
      const response = await axios.post(url, {
        address: address,
        recent_block: 1
      });
      
      if (!response.data || !response.data.data || !response.data.data.list || response.data.data.list.length === 0) {
        throw new Error(`Invalid response from ${chain} API`);
      }
      
      const balanceData = response.data.data.list[0];
      const balanceInToken = (parseInt(balanceData.balance) / Math.pow(10, 10)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: ticker,
          Amount: balanceInToken,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: balanceData.block_num || '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: `${chain.charAt(0).toUpperCase() + chain.slice(1)} Subscan API`,
            chain: chain.charAt(0).toUpperCase() + chain.slice(1),
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching ${chain} balance:`, error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async nearHandler(req, res) {
    try {
      const { address } = req.params;
      const url = 'https://rpc.mainnet.near.org';
      
      const response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          request_type: 'view_account',
          finality: 'final',
          account_id: address
        }
      });
      
      if (!response.data || !response.data.result || !response.data.result.amount) {
        throw new Error('Invalid response from NEAR API');
      }
      
      const balanceInNear = (parseInt(response.data.result.amount) / Math.pow(10, 24)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'NEAR',
          Amount: balanceInNear,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: response.data.result.block_height || '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'NEAR RPC API',
            chain: 'NEAR',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching NEAR balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async stacksHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://api.hiro.so/extended/v1/address/${address}/balances`;
      
      const response = await axios.get(url, {
        headers: {
          'principal': API_KEYS.stacks
        }
      });
      
      if (!response.data || !response.data.stx) {
        throw new Error('Invalid response from Stacks API');
      }
      
      const balanceInStx = (parseInt(response.data.stx.balance) / Math.pow(10, 6)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'STX',
          Amount: balanceInStx,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Stacks API',
            chain: 'Stacks',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Stacks balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async blastHandler(req, res) {
    try {
      const { address } = req.params;
      const url = 'https://zksync-mainnet.public.blastapi.io';
      
      const response = await axios.post(url, {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address]
      });
      
      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from Blast API');
      }
      
      const balanceInWei = parseInt(response.data.result, 16);
      const balanceInEth = (balanceInWei / Math.pow(10, 18)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'ETH',
          Amount: balanceInEth,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Blast API',
            chain: 'Blast',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Blast balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  },

  async cardanoHandler(req, res) {
    try {
      const { address } = req.params;
      const url = `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`;
      
      const response = await axios.get(url, {
        headers: {
          'project_id': API_KEYS.cardano
        }
      });
      
      if (!response.data || !response.data.amount) {
        throw new Error('Invalid response from Cardano API');
      }
      
      const adaAmount = response.data.amount.find(a => a.unit === 'lovelace') || { quantity: '0' };
      const balanceInAda = (parseInt(adaAmount.quantity) / Math.pow(10, 6)).toString();
      
      res.status(200).json({
        success: true,
        data: {
          Ticker: 'ADA',
          Amount: balanceInAda,
          WalletId: `bitwave-wallet-id-${address.substring(0, 8)}`,
          RemoteWalletId: address,
          BlockId: '0',
          TimestampSEC: Math.floor(Date.now() / 1000).toString(),
          RawMetadata: {
            source: 'Cardano Blockfrost API',
            chain: 'Cardano',
            raw_response: response.data
          }
        }
      });
    } catch (error) {
      console.error('Error fetching Cardano balance:', error);
      res.status(500).json({
        success: false,
        errors: [error.message]
      });
    }
  }
};

app.get('/api/v1/chains/:chain/addresses/:address/balance', (req, res) => {
  const { chain } = req.params;
  
  switch(chain) {
    case 'ethereum':
    case 'arbitrum':
    case 'polygon':
    case 'bsc':
    case 'fantom':
    case 'optimism':
    case 'base':
      handlers.etherscanHandler(req, res, chain);
      break;
    case 'avalanche_c':
      handlers.avalancheHandler(req, res);
      break;
    
    case 'litecoin':
      handlers.blockcypherHandler(req, res, 'litecoin');
      break;
    case 'bitcoin':
      handlers.blockcypherHandler(req, res, 'bitcoin');
      break;
    
    case 'gnosis':
      handlers.blockscoutHandler(req, res, 'gnosis');
      break;
    case 'celo':
      handlers.blockscoutHandler(req, res, 'celo');
      break;
    case 'aurora':
      handlers.blockscoutHandler(req, res, 'aurora');
      break;
    
    case 'bitcoin-info':
      handlers.blockchainInfoHandler(req, res);
      break;
    
    case 'stellar':
      handlers.stellarHandler(req, res);
      break;
    
    case 'hedera':
      handlers.hederaHandler(req, res);
      break;
    
    case 'evmos':
    case 'umee':
    case 'kyve':
    case 'persistence':
    case 'axelar':
    case 'celestia':
    case 'kava':
    case 'agoric':
    case 'akash':
    case 'regen':
    case 'provenance':
    case 'osmosis':
      handlers.cosmosHandler(req, res, chain);
      break;
    
    case 'filecoin':
      handlers.filecoinHandler(req, res);
      break;
    
    case 'deso':
      handlers.desoHandler(req, res);
      break;
    
    case 'sui':
      handlers.suiHandler(req, res);
      break;
    
    case 'arweave':
      handlers.arweaveHandler(req, res);
      break;
    
    case 'kusama':
    case 'polkadot':
      handlers.subscanHandler(req, res, chain);
      break;
    
    case 'near':
      handlers.nearHandler(req, res);
      break;
    
    case 'stacks':
      handlers.stacksHandler(req, res);
      break;
    
    case 'blast':
      handlers.blastHandler(req, res);
      break;
    
    case 'cardano':
      handlers.cardanoHandler(req, res);
      break;
    
    default:
      res.status(400).json({
        success: false,
        errors: [`Unsupported blockchain: ${chain}`]
      });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }
  
  if (apiKey === 'BITWAVETRIAL') {
    return res.json({ success: true, message: 'Trial API key is valid', isTrial: true });
  }
  
  if (apiKeys.includes(apiKey)) {
    return res.json({ success: true, message: 'API key is valid' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid API key' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Multi Blockchain Wallet Balance Service running on port ${PORT}`);
  console.log(`Login page available at http://localhost:${PORT}/login.html`);
  console.log(`Main interface available at http://localhost:${PORT}/`);
});
