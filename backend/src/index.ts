import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import balanceRoutes from './routes/balance-routes';
import { AdapterRegistry } from './services/adapter-registry';
import { EtherscanAdapter } from './adapters/etherscan-adapter';
import { BlockCypherAdapter } from './adapters/blockcypher-adapter';
import { BlockscoutAdapter } from './adapters/blockscout-adapter';
import { StellarAdapter } from './adapters/stellar-adapter';

dotenv.config();

AdapterRegistry.registerChain({ name: 'Ethereum', chainId: '1', provider: 'ethereum' });
AdapterRegistry.registerChain({ name: 'Polygon', chainId: '137', provider: 'polygon' });
AdapterRegistry.registerChain({ name: 'Binance Smart Chain', chainId: '56', provider: 'bsc' });
AdapterRegistry.registerChain({ name: 'Litecoin', chainId: '2', provider: 'blockcypher' });
AdapterRegistry.registerChain({ name: 'Stellar', chainId: '148', provider: 'stellar' });
AdapterRegistry.registerChain({ name: 'Gnosis Chain', chainId: '100', provider: 'blockscout' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api', balanceRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1/`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
