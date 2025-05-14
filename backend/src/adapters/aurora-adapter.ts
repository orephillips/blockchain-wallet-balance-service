import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class AuroraAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Aurora';
    this.baseUrl = 'http://explorer.mainnet.aurora.dev/api';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Aurora API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      const tokenBalances = await this.getERC20Balances(chainId, address);
      
      return [nativeBalance, ...tokenBalances];
    } catch (error) {
      console.error('Error in Aurora getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Aurora API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          module: 'account',
          action: 'balance',
          address: address
        }
      });
      
      if (response.data.status !== '1') {
        throw new Error(`Aurora API error: ${response.data.message || 'Unknown error'}`);
      }
      
      const balanceInWei = response.data.result;
      const balanceInETH = (parseInt(balanceInWei) / 1e18).toString();
      
      return {
        Ticker: 'ETH',
        Amount: balanceInETH,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0', // Aurora API doesn't provide block info in this endpoint
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Aurora Explorer API',
          chain: this.chainName,
          raw_response: response.data
        }
      };
    } catch (error) {
      console.error('Error in Aurora getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Aurora API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Aurora getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Aurora API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          module: 'account',
          action: 'tokenbalance',
          contractaddress: tokenAddress,
          address: address
        }
      });
      
      if (response.data.status !== '1') {
        throw new Error(`Aurora API error: ${response.data.message || 'Unknown error'}`);
      }
      
      const balanceRaw = response.data.result;
      
      const tokenSymbol = 'TOKEN';
      const tokenDecimals = 18;
      const balanceFormatted = (parseInt(balanceRaw) / Math.pow(10, tokenDecimals)).toString();
      
      return {
        Ticker: tokenSymbol,
        Amount: balanceFormatted,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0', // Aurora API doesn't provide block info in this endpoint
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Aurora Explorer API',
          chain: this.chainName,
          raw_response: response.data
        }
      };
    } catch (error) {
      console.error('Error in Aurora getERC20Balance:', error);
      throw error;
    }
  }
}
