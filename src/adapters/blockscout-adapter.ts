import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class BlockscoutAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Gnosis Chain';
    this.baseUrl = 'https://blockscout.com/xdai/mainnet/api';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blockscout API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in Blockscout getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blockscout API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await this.fetchNativeBalance(address);
      
      return this.processNativeBalance(response, address);
    } catch (error) {
      console.error('Error in Blockscout getNativeBalance:', error);
      throw error;
    }
  }
  
  private async fetchNativeBalance(address: string): Promise<any> {
    try {
      const url = `${this.baseUrl}?module=account&action=balance&address=${address}`;
      const response = await axios.get(url);
      
      if (!response.data || response.data.status !== '1') {
        throw new Error(`API Error: ${response.data?.message || 'Unknown error'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching native balance from Blockscout API:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blockscout API: Fetching ERC20 balances for ${address} on chain ${chainId}`);
      
      const tokenBalances = await this.fetchTokenBalances(address);
      return tokenBalances;
    } catch (error) {
      console.error('Error in Blockscout getERC20Balances:', error);
      throw error;
    }
  }
  
  private async fetchTokenBalances(address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      const url = `${this.baseUrl}?module=account&action=tokenlist&address=${address}`;
      const response = await axios.get(url);
      
      if (!response.data || response.data.status !== '1') {
        throw new Error(`API Error: ${response.data?.message || 'Unknown error'}`);
      }
      
      const tokens = response.data.result || [];
      return tokens.map((token: any) => this.formatTokenBalance({
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || 'Unknown Token',
        balance: (parseInt(token.balance) / Math.pow(10, parseInt(token.decimals))).toString(),
        address: token.contractAddress
      }, address));
    } catch (error) {
      console.error('Error fetching token balances from Blockscout API:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blockscout API: Fetching ERC20 balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const tokenBalance = await this.fetchTokenBalance(address, tokenAddress);
      return tokenBalance;
    } catch (error) {
      console.error('Error in Blockscout getERC20Balance:', error);
      throw error;
    }
  }
  
  private async fetchTokenBalance(address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      const url = `${this.baseUrl}?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}`;
      const response = await axios.get(url);
      
      if (!response.data || response.data.status !== '1') {
        throw new Error(`API Error: ${response.data?.message || 'Unknown error'}`);
      }
      
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      
      return this.formatTokenBalance({
        symbol: tokenMetadata.symbol,
        name: tokenMetadata.name,
        balance: (parseInt(response.data.result) / Math.pow(10, tokenMetadata.decimals)).toString(),
        address: tokenAddress
      }, address);
    } catch (error) {
      console.error('Error fetching token balance from Blockscout API:', error);
      throw error;
    }
  }
  
  private async fetchTokenMetadata(tokenAddress: string): Promise<{symbol: string, name: string, decimals: number}> {
    try {
      const url = `${this.baseUrl}?module=token&action=getToken&contractaddress=${tokenAddress}`;
      const response = await axios.get(url);
      
      if (!response.data || response.data.status !== '1') {
        return { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 };
      }
      
      const token = response.data.result;
      return {
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || 'Unknown Token',
        decimals: parseInt(token.decimals) || 18
      };
    } catch (error) {
      console.error('Error fetching token metadata from Blockscout API:', error);
      return { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 };
    }
  }


  private processNativeBalance(response: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInWei = response.result;
    const balance = (parseInt(balanceInWei) / 1e18).toString();
    
    return {
      Ticker: 'xDAI',
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Blockscout doesn't provide block height in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Blockscout API',
        chain: this.chainName,
        raw_response: response
      }
    };
  }

  private formatTokenBalance(
    token: { symbol: string, name: string, balance: string, address: string },
    address: string
  ): WalletBalanceImportRecordV1 {
    return {
      Ticker: token.symbol,
      Amount: token.balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Blockscout doesn't provide block height in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Blockscout API',
        chain: this.chainName,
        raw_response: {
          tokenAddress: token.address,
          tokenName: token.name
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
