import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class StellarAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Stellar';
    this.baseUrl = 'https://horizon.stellar.org';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Stellar API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.fetchAccountInfo(address);
      
      const balances: WalletBalanceImportRecordV1[] = [];
      
      if (accountInfo.balances && accountInfo.balances.length > 0) {
        for (const balance of accountInfo.balances) {
          balances.push(this.formatBalance(balance, address, accountInfo));
        }
      }
      
      return balances;
    } catch (error) {
      console.error('Error in Stellar getBalances:', error);
      throw error;
    }
  }
  
  private async fetchAccountInfo(address: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts/${address}`);
      
      if (!response.data) {
        throw new Error('No account data returned from Stellar API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching account info from Stellar API:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Stellar API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.fetchAccountInfo(address);
      
      const nativeBalance = accountInfo.balances.find((b: any) => b.asset_type === 'native');
      
      if (!nativeBalance) {
        throw new Error('Native XLM balance not found');
      }
      
      return this.formatBalance(nativeBalance, address, accountInfo);
    } catch (error) {
      console.error('Error in Stellar getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Stellar API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.fetchAccountInfo(address);
      
      const tokenBalances = accountInfo.balances.filter((b: any) => b.asset_type !== 'native');
      
      return tokenBalances.map((balance: any) => this.formatBalance(balance, address, accountInfo));
    } catch (error) {
      console.error('Error in Stellar getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Stellar API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const accountInfo = await this.fetchAccountInfo(address);
      
      const [assetCode, assetIssuer] = this.parseTokenAddress(tokenAddress);
      
      const tokenBalance = accountInfo.balances.find((b: any) => 
        b.asset_type !== 'native' && 
        b.asset_code === assetCode && 
        b.asset_issuer === assetIssuer
      );
      
      if (!tokenBalance) {
        throw new Error(`Token ${tokenAddress} not found for account ${address}`);
      }
      
      return this.formatBalance(tokenBalance, address, accountInfo);
    } catch (error) {
      console.error('Error in Stellar getERC20Balance:', error);
      throw error;
    }
  }

  private parseTokenAddress(tokenAddress: string): [string, string] {
    const parts = tokenAddress.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid token address format. Expected "CODE:ISSUER"');
    }
    
    return [parts[0], parts[1]];
  }


  private formatBalance(
    balance: any,
    address: string,
    accountInfo: any
  ): WalletBalanceImportRecordV1 {
    let ticker: string;
    
    if (balance.asset_type === 'native') {
      ticker = 'XLM';
    } else {
      ticker = balance.asset_code;
    }
    
    return {
      Ticker: ticker,
      Amount: balance.balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: accountInfo.last_modified_ledger.toString(),
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Stellar Horizon API',
        chain: this.chainName,
        raw_response: {
          asset_type: balance.asset_type,
          asset_code: balance.asset_code,
          asset_issuer: balance.asset_issuer
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
