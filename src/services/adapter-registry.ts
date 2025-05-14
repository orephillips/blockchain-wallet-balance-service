import { BalanceAdapter } from '../adapters/base-adapter';
import { GlacierBalanceAdapter } from '../adapters/glacier-adapter';
import { BlockscoutAdapter } from '../adapters/blockscout-adapter';
import { HederaAdapter } from '../adapters/hedera-adapter';
import { BlockCypherAdapter } from '../adapters/blockcypher-adapter';
import { StellarAdapter } from '../adapters/stellar-adapter';
import { BlockchainInfoAdapter } from '../adapters/blockchain-info-adapter';
import { CeloExplorerAdapter } from '../adapters/celo-explorer-adapter';
import { CosmosAdapter } from '../adapters/cosmos-adapter';
import { EtherscanAdapter } from '../adapters/etherscan-adapter';
import { FilecoinAdapter } from '../adapters/filecoin-adapter';
import { AgoricAdapter } from '../adapters/agoric-adapter';
import { DesoAdapter } from '../adapters/deso-adapter';
import { SuiAdapter } from '../adapters/sui-adapter';
import { ArweaveAdapter } from '../adapters/arweave-adapter';
import { AuroraAdapter } from '../adapters/aurora-adapter';
import { CardanoAdapter } from '../adapters/cardano-adapter';
import { KusamaAdapter } from '../adapters/kusama-adapter';
import { NearAdapter } from '../adapters/near-adapter';
import { PolkadotAdapter } from '../adapters/polkadot-adapter';
import { StacksAdapter } from '../adapters/stacks-adapter';
import { BlastAdapter } from '../adapters/blast-adapter';
import { ChainConfig } from '../models/types';
import dotenv from 'dotenv';

dotenv.config();

const chainConfigs: ChainConfig[] = [
  {
    name: 'Avalanche',
    chainId: '43114',
    provider: 'glacier'
  },
  {
    name: 'Gnosis Chain',
    chainId: '100',
    provider: 'blockscout'
  },
  {
    name: 'Hedera',
    chainId: '295',
    provider: 'hedera'
  },
  {
    name: 'Litecoin',
    chainId: '2',
    provider: 'blockcypher'
  },
  {
    name: 'Stellar',
    chainId: '148',
    provider: 'stellar'
  },
  {
    name: 'Bitcoin',
    chainId: '1',
    provider: 'blockchain-info'
  },
  {
    name: 'Celo',
    chainId: '42220',
    provider: 'celo-explorer'
  },
  {
    name: 'Evmos',
    chainId: '9001',
    provider: 'evmos-cosmos'
  },
  {
    name: 'Umee',
    chainId: '8001',
    provider: 'umee-cosmos'
  },
  {
    name: 'Kyve',
    chainId: '8002',
    provider: 'kyve-cosmos'
  },
  {
    name: 'Persistence',
    chainId: '8003',
    provider: 'persistence-cosmos'
  },
  {
    name: 'Axelar',
    chainId: '8004',
    provider: 'axelar-cosmos'
  },
  {
    name: 'Celestia',
    chainId: '8005',
    provider: 'celestia-cosmos'
  },
  {
    name: 'Kava',
    chainId: '8006',
    provider: 'kava-cosmos'
  },
  {
    name: 'Agoric',
    chainId: '8007',
    provider: 'agoric'
  },
  {
    name: 'Akash',
    chainId: '8008',
    provider: 'akash-cosmos'
  },
  {
    name: 'Regen',
    chainId: '8009',
    provider: 'regen-cosmos'
  },
  {
    name: 'Provenance',
    chainId: '8010',
    provider: 'provenance-cosmos'
  },
  {
    name: 'Osmosis',
    chainId: '8011',
    provider: 'osmosis-cosmos'
  },
  {
    name: 'Arbitrum',
    chainId: '42161',
    provider: 'arbitrum'
  },
  {
    name: 'Ethereum',
    chainId: '1',
    provider: 'ethereum'
  },
  {
    name: 'Polygon',
    chainId: '137',
    provider: 'polygon'
  },
  {
    name: 'Binance Smart Chain',
    chainId: '56',
    provider: 'bsc'
  },
  {
    name: 'Fantom',
    chainId: '250',
    provider: 'fantom'
  },
  {
    name: 'Optimism',
    chainId: '10',
    provider: 'optimism'
  },
  {
    name: 'Base',
    chainId: '8453',
    provider: 'base'
  },
  {
    name: 'Filecoin',
    chainId: '314',
    provider: 'filecoin'
  },
  {
    name: 'Deso',
    chainId: '555',
    provider: 'deso'
  },
  {
    name: 'SUI',
    chainId: '784',
    provider: 'sui'
  },
  {
    name: 'Arweave',
    chainId: '900',
    provider: 'arweave'
  },
  {
    name: 'Aurora',
    chainId: '1313161554',
    provider: 'aurora'
  },
  {
    name: 'Cardano',
    chainId: '1815',
    provider: 'cardano'
  },
  {
    name: 'Kusama',
    chainId: '434',
    provider: 'kusama'
  },
  {
    name: 'NEAR',
    chainId: '1313161554',
    provider: 'near'
  },
  {
    name: 'Polkadot',
    chainId: '354',
    provider: 'polkadot'
  },
  {
    name: 'Stacks',
    chainId: '5757',
    provider: 'stacks'
  },
  {
    name: 'Blast',
    chainId: '81457',
    provider: 'blast'
  }
];

const adapterRegistry: Record<string, BalanceAdapter> = {
  glacier: new GlacierBalanceAdapter(),
  blockscout: new BlockscoutAdapter(),
  hedera: new HederaAdapter(),
  blockcypher: new BlockCypherAdapter(),
  stellar: new StellarAdapter(),
  'blockchain-info': new BlockchainInfoAdapter(),
  'celo-explorer': new CeloExplorerAdapter(),
  'evmos-cosmos': new CosmosAdapter('Evmos', 'https://rest.cosmos.directory/evmos', 'EVMOS'),
  'umee-cosmos': new CosmosAdapter('Umee', 'https://rest.cosmos.directory/umee', 'UMEE'),
  'kyve-cosmos': new CosmosAdapter('Kyve', 'https://rest.cosmos.directory/kyve', 'KYVE'),
  'persistence-cosmos': new CosmosAdapter('Persistence', 'https://rest.cosmos.directory/persistence', 'XPRT'),
  'axelar-cosmos': new CosmosAdapter('Axelar', 'https://rest.cosmos.directory/axelar', 'AXL'),
  'celestia-cosmos': new CosmosAdapter('Celestia', 'https://rest.cosmos.directory/celestia', 'TIA'),
  'kava-cosmos': new CosmosAdapter('Kava', 'https://rest.cosmos.directory/kava', 'KAVA'),
  'agoric': new AgoricAdapter(),
  'akash-cosmos': new CosmosAdapter('Akash', 'https://rest.cosmos.directory/akash', 'AKT'),
  'regen-cosmos': new CosmosAdapter('Regen', 'https://rest.cosmos.directory/regen', 'REGEN'),
  'provenance-cosmos': new CosmosAdapter('Provenance', 'https://rest.cosmos.directory/provenance', 'HASH'),
  'osmosis-cosmos': new CosmosAdapter('Osmosis', 'https://rest.cosmos.directory/osmosis', 'OSMO'),
  'arbitrum': new EtherscanAdapter(
    'Arbitrum', 
    'https://api.arbiscan.io/api', 
    process.env.ARBISCAN_API_KEY || '', 
    'ARB'
  ),
  'ethereum': new EtherscanAdapter(
    'Ethereum', 
    'https://api.etherscan.io/api', 
    process.env.ETHERSCAN_API_KEY || '', 
    'ETH'
  ),
  'polygon': new EtherscanAdapter(
    'Polygon', 
    'https://api.polygonscan.com/api', 
    process.env.POLYSCAN_API_KEY || '', 
    'MATIC'
  ),
  'bsc': new EtherscanAdapter(
    'Binance Smart Chain', 
    'https://api.bscscan.com/api', 
    process.env.BSCSCAN_API_KEY || '', 
    'BNB'
  ),
  'fantom': new EtherscanAdapter(
    'Fantom', 
    'https://api.ftmscan.com/api', 
    process.env.FANTOM_API_KEY || '', 
    'FTM'
  ),
  'optimism': new EtherscanAdapter(
    'Optimism', 
    'https://api-optimistic.etherscan.io/api', 
    process.env.OPTIMISM_API_KEY || '', 
    'OP'
  ),
  'base': new EtherscanAdapter(
    'Base', 
    'https://api.basescan.org/api', 
    process.env.BASE_API_KEY || '', 
    'ETH'
  ),
  'filecoin': new FilecoinAdapter(),
  'deso': new DesoAdapter(),
  'sui': new SuiAdapter(),
  'arweave': new ArweaveAdapter(),
  'aurora': new AuroraAdapter(),
  'cardano': new CardanoAdapter(),
  'kusama': new KusamaAdapter(),
  'near': new NearAdapter(),
  'polkadot': new PolkadotAdapter(),
  'stacks': new StacksAdapter(),
  'blast': new BlastAdapter()
};

export class AdapterRegistry {
  static getAdapterForChain(chainId: string): BalanceAdapter | null {
    const chainConfig = chainConfigs.find(config => config.chainId === chainId);
    if (!chainConfig) {
      return null;
    }
    
    const adapter = adapterRegistry[chainConfig.provider];
    if (!adapter) {
      return null;
    }
    
    return adapter;
  }
  
  static getSupportedChains(): ChainConfig[] {
    return [...chainConfigs];
  }
  
  static registerChain(config: ChainConfig): void {
    const existingIndex = chainConfigs.findIndex(c => c.chainId === config.chainId);
    if (existingIndex >= 0) {
      chainConfigs[existingIndex] = config;
    } else {
      chainConfigs.push(config);
    }
  }
  
  static registerAdapter(providerName: string, adapter: BalanceAdapter): void {
    adapterRegistry[providerName] = adapter;
  }
}
