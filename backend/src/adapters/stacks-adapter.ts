import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class StacksAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    super();
    this.chainName = 'Stacks';
    this.baseUrl = 'https://api.hiro.so/extended/v1';
    this.apiKey = process.env.STACKS_API_KEY || '';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Stacks API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}/address/${address}/balances`, {
        headers: this.apiKey ? { 'x-api-key': this.apiKey } : {}
      });
      
      if (!response.data) {
        throw new Error('No balance data returned from Stacks API');
      }
      
      const balances: WalletBalanceImportRecordV1[] = [];
      
      const stxBalance = this.formatSTXBalance(response.data.stx, address);
      balances.push(stxBalance);
      
      const tokenBalances = this.formatTokenBalances(response.data.fungible_tokens, address);
      balances.push(...tokenBalances);
      
      return balances;
    } catch (error) {
      console.error('Error in Stacks getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Stacks API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}/address/${address}/balances`, {
        headers: this.apiKey ? { 'x-api-key': this.apiKey } : {}
      });
      
      if (!response.data || !response.data.stx) {
        throw new Error('No STX balance data returned from Stacks API');
      }
      
      return this.formatSTXBalance(response.data.stx, address);
    } catch (error) {
      console.error('Error in Stacks getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Stacks API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}/address/${address}/balances`, {
        headers: this.apiKey ? { 'x-api-key': this.apiKey } : {}
      });
      
      if (!response.data || !response.data.fungible_tokens) {
        return [];
      }
      
      return this.formatTokenBalances(response.data.fungible_tokens, address);
    } catch (error) {
      console.error('Error in Stacks getERC20Balances:', error);
      return [];
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Stacks API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const response = await axios.get(`${this.baseUrl}/address/${address}/balances`, {
        headers: this.apiKey ? { 'x-api-key': this.apiKey } : {}
      });
      
      if (!response.data || !response.data.fungible_tokens || !response.data.fungible_tokens[tokenAddress]) {
        throw new Error(`Token ${tokenAddress} not found for address ${address}`);
      }
      
      const tokenData = response.data.fungible_tokens[tokenAddress];
      
      return {
        Ticker: tokenData.name || tokenAddress,
        Amount: (parseInt(tokenData.balance) / Math.pow(10, tokenData.decimals || 0)).toString(),
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Stacks API',
          chain: this.chainName,
          raw_response: tokenData
        }
      };
    } catch (error) {
      console.error('Error in Stacks getERC20Balance:', error);
      throw error;
    }
  }

  private formatSTXBalance(stxData: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInMicroSTX = stxData.balance;
    const balanceInSTX = (parseInt(balanceInMicroSTX) / 1e6).toString(); // 1 STX = 1e6 microSTX
    
    return {
      Ticker: 'STX',
      Amount: balanceInSTX,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Stacks API doesn't provide block info in this endpoint
      TimestampSEC: Math.floor(Date.now() / 1000).toString(),
      RawMetadata: {
        source: 'Stacks API',
        chain: this.chainName,
        raw_response: stxData
      }
    };
  }

  private formatTokenBalances(tokensData: any, address: string): WalletBalanceImportRecordV1[] {
    const balances: WalletBalanceImportRecordV1[] = [];
    
    for (const [tokenId, tokenData] of Object.entries(tokensData)) {
      balances.push({
        Ticker: (tokenData as any).name || tokenId,
        Amount: (parseInt((tokenData as any).balance) / Math.pow(10, (tokenData as any).decimals || 0)).toString(),
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '0',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'Stacks API',
          chain: this.chainName,
          raw_response: tokenData
        }
      });
    }
    
    return balances;
  }
}
