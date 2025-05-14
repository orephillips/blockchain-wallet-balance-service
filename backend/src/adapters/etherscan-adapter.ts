import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class EtherscanAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly nativeTicker: string;
  private readonly nativeDecimals: number;

  constructor(
    chainName: string,
    baseUrl: string,
    apiKey: string,
    nativeTicker: string,
    nativeDecimals: number = 18
  ) {
    super();
    this.chainName = chainName;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.nativeTicker = nativeTicker;
    this.nativeDecimals = nativeDecimals;
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`${this.chainName} API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error(`Error in ${this.chainName} getBalances:`, error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`${this.chainName} API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await this.fetchNativeBalance(address);
      
      return this.processNativeBalance(response, address);
    } catch (error) {
      console.error(`Error in ${this.chainName} getNativeBalance:`, error);
      throw error;
    }
  }
  
  private async fetchNativeBalance(address: string): Promise<any> {
    try {
      const url = `${this.baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching native balance from ${this.chainName} API:`, error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`${this.chainName} API: Fetching token balances for ${address} on chain ${chainId}`);
      
      console.warn(`${this.chainName} API: Getting all token balances requires token addresses in advance. Use getERC20Balance with specific token addresses.`);
      
      return [];
    } catch (error) {
      console.error(`Error in ${this.chainName} getERC20Balances:`, error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`${this.chainName} API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const response = await this.fetchTokenBalance(address, tokenAddress);
      
      return this.processTokenBalance(response, address, tokenAddress);
    } catch (error) {
      console.error(`Error in ${this.chainName} getERC20Balance:`, error);
      throw error;
    }
  }
  
  private async fetchTokenBalance(address: string, tokenAddress: string): Promise<any> {
    try {
      const url = `${this.baseUrl}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&tag=latest&apikey=${this.apiKey}`;
      const response = await axios.get(url);
      
      if (response.data.status !== '1') {
        throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching token balance from ${this.chainName} API:`, error);
      throw error;
    }
  }

  private async fetchTokenMetadata(tokenAddress: string): Promise<{symbol: string, name: string, decimals: number}> {
    try {
      return {
        symbol: `TOKEN-${tokenAddress.substring(0, 6)}`,
        name: 'Unknown Token',
        decimals: 18
      };
    } catch (error) {
      console.error(`Error fetching token metadata for ${tokenAddress}:`, error);
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18
      };
    }
  }

  private processNativeBalance(response: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInWei = response.result;
    const balance = (parseInt(balanceInWei) / Math.pow(10, this.nativeDecimals)).toString();
    
    return {
      Ticker: this.nativeTicker,
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: `${this.chainName} API`,
        chain: this.chainName,
        raw_response: response
      }
    };
  }

  private processTokenBalance(response: any, address: string, tokenAddress: string): WalletBalanceImportRecordV1 {
    const balanceRaw = response.result;
    const decimals = 18; // Default for most ERC20 tokens
    const balance = (parseInt(balanceRaw) / Math.pow(10, decimals)).toString();
    
    const ticker = `TOKEN-${tokenAddress.substring(0, 6)}`;
    
    return {
      Ticker: ticker,
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: `${this.chainName} API`,
        chain: this.chainName,
        raw_response: {
          ...response,
          tokenAddress: tokenAddress
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
