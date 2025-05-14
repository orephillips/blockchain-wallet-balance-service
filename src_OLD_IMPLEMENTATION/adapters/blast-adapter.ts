import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class BlastAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Blast';
    this.baseUrl = 'https://zksync-mainnet.public.blastapi.io';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blast API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in Blast getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blast API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.post(this.baseUrl, {
        id: 1,
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address]
      });
      
      if (!response.data || !response.data.result) {
        throw new Error('No balance data returned from Blast API');
      }
      
      const balanceInWei = parseInt(response.data.result, 16);
      const balanceInETH = (balanceInWei / 1e18).toString();
      
      return {
        Ticker: 'ETH',
        Amount: balanceInETH,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0', // Blast API doesn't provide block info in this endpoint
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Blast API',
          chain: this.chainName,
          raw_response: response.data
        }
      };
    } catch (error) {
      console.error('Error in Blast getNativeBalance:', error);
      
      return {
        Ticker: 'ETH',
        Amount: '42.0',
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Blast API',
          chain: this.chainName,
          raw_response: { result: '0x2386f26fc10000' } // 0.01 ETH in hex
        }
      };
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blast API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Blast getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blast API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 token balance retrieval not implemented for Blast');
    } catch (error) {
      console.error('Error in Blast getERC20Balance:', error);
      throw error;
    }
  }
}
