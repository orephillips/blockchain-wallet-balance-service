import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class ArweaveAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Arweave';
    this.baseUrl = 'https://arweave.net';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Arweave API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in Arweave getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Arweave API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}/wallet/${address}/balance`);
      const balanceInWinston = response.data;
      
      const balanceInAR = (parseInt(balanceInWinston) / 1e12).toString();
      
      return {
        Ticker: 'AR',
        Amount: balanceInAR,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0', // Arweave doesn't provide block info in balance endpoint
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Arweave API',
          chain: this.chainName,
          raw_response: { balance: balanceInWinston }
        }
      };
    } catch (error) {
      console.error('Error in Arweave getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Arweave API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Arweave getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Arweave API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens are not supported on Arweave');
    } catch (error) {
      console.error('Error in Arweave getERC20Balance:', error);
      throw error;
    }
  }
}
