import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class CeloExplorerAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Celo';
    this.baseUrl = 'https://explorer.celo.org/mainnet/api';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Celo Explorer API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      const tokenBalances = await this.getERC20Balances(chainId, address);
      
      return [nativeBalance, ...tokenBalances];
    } catch (error) {
      console.error('Error in Celo Explorer getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Celo Explorer API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockNativeBalance(address);
      
      return this.processNativeBalance(mockResponse, address);
    } catch (error) {
      console.error('Error in Celo Explorer getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Celo Explorer API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const mockTokens = this.getMockTokenData();
      
      return mockTokens.map(token => this.formatTokenBalance(token, address));
    } catch (error) {
      console.error('Error in Celo Explorer getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Celo Explorer API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const mockTokens = this.getMockTokenData();
      const token = mockTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
      
      if (token) {
        return this.formatTokenBalance(token, address);
      }
      
      return this.formatTokenBalance({
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        balance: '0',
        address: tokenAddress
      }, address);
    } catch (error) {
      console.error('Error in Celo Explorer getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockNativeBalance(address: string): Promise<any> {
    await this.delay(300);
    
    return {
      status: "1",
      message: "OK",
      result: "5000000000000000000" // 5 CELO in wei
    };
  }

  private getMockTokenData(): Array<{ 
    symbol: string, 
    name: string, 
    balance: string, 
    address: string 
  }> {
    return [
      {
        symbol: 'cUSD',
        name: 'Celo Dollar',
        balance: '100.5',
        address: '0x765DE816845861e75A25fCA122bb6898B8B1282a'
      },
      {
        symbol: 'cEUR',
        name: 'Celo Euro',
        balance: '75.25',
        address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73'
      }
    ];
  }

  private processNativeBalance(response: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInWei = response.result;
    const balance = (parseInt(balanceInWei) / 1e18).toString();
    
    return {
      Ticker: 'CELO',
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Celo Explorer API',
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
      BlockId: '0', // Mock block height
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Celo Explorer API',
        chain: this.chainName,
        raw_response: {
          tokenAddress: token.address,
          tokenName: token.name,
          mockData: true
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
