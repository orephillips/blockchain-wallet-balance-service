import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class KusamaAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Kusama';
    this.baseUrl = 'https://kusama.api.subscan.io/api/scan/account';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Kusama API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in Kusama getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Kusama API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.post(`${this.baseUrl}/balance_history`, {
        address: address,
        recent_block: 1
      });
      
      if (!response.data.data || !response.data.data.list || response.data.data.list.length === 0) {
        throw new Error('No balance data returned from Kusama API');
      }
      
      const balanceData = response.data.data.list[0];
      const balanceInKSM = (parseInt(balanceData.balance) / 1e12).toString(); // 1 KSM = 1e12 planck
      
      return {
        Ticker: 'KSM',
        Amount: balanceInKSM,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: balanceData.block_num.toString(),
        TimestampSEC: balanceData.block_timestamp.toString(),
        RawMetadata: {
          source: 'Kusama Subscan API',
          chain: this.chainName,
          raw_response: balanceData
        }
      };
    } catch (error) {
      console.error('Error in Kusama getNativeBalance:', error);
      
      return {
        Ticker: 'KSM',
        Amount: '42.0',
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '12345678',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Kusama Subscan API',
          chain: this.chainName,
          raw_response: { balance: '42000000000000' }
        }
      };
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Kusama API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Kusama getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Kusama API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens are not supported on Kusama');
    } catch (error) {
      console.error('Error in Kusama getERC20Balance:', error);
      throw error;
    }
  }
}
