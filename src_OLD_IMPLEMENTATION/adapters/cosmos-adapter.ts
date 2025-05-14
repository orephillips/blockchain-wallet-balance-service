import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class CosmosAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;
  private readonly nativeTicker: string;

  constructor(chainName: string, baseUrl: string, nativeTicker: string) {
    super();
    this.chainName = chainName;
    this.baseUrl = baseUrl;
    this.nativeTicker = nativeTicker;
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Cosmos API: Fetching all balances for ${address} on chain ${this.chainName}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      return this.processBalances(mockResponse, address);
    } catch (error) {
      console.error(`Error in ${this.chainName} getBalances:`, error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Cosmos API: Fetching native balance for ${address} on chain ${this.chainName}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const nativeBalance = mockResponse.balances.find((b: any) => 
        b.denom === this.getNativeDenom()
      );
      
      if (!nativeBalance) {
        throw new Error(`Native ${this.nativeTicker} balance not found`);
      }
      
      return this.formatBalance(nativeBalance, address, mockResponse);
    } catch (error) {
      console.error(`Error in ${this.chainName} getNativeBalance:`, error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Cosmos API: Fetching token balances for ${address} on chain ${this.chainName}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const tokenBalances = mockResponse.balances.filter((b: any) => 
        b.denom !== this.getNativeDenom()
      );
      
      return tokenBalances.map((balance: any) => this.formatBalance(balance, address, mockResponse));
    } catch (error) {
      console.error(`Error in ${this.chainName} getERC20Balances:`, error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Cosmos API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${this.chainName}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const tokenBalance = mockResponse.balances.find((b: any) => b.denom === tokenAddress);
      
      if (!tokenBalance) {
        throw new Error(`Token ${tokenAddress} not found for account ${address}`);
      }
      
      return this.formatBalance(tokenBalance, address, mockResponse);
    } catch (error) {
      console.error(`Error in ${this.chainName} getERC20Balance:`, error);
      throw error;
    }
  }

  private getNativeDenom(): string {
    const denomMap: Record<string, string> = {
      'Evmos': 'aevmos',
      'Umee': 'uumee',
      'Kyve': 'ukyve',
      'Persistence': 'uxprt',
      'Axelar': 'uaxl',
      'Celestia': 'utia',
      'Kava': 'ukava',
      'Agoric': 'ubld',
      'Akash': 'uakt',
      'Regen': 'uregen',
      'Provenance': 'nhash',
      'Osmosis': 'uosmo'
    };
    
    return denomMap[this.chainName] || `u${this.nativeTicker.toLowerCase()}`;
  }

  private async getMockBalances(address: string): Promise<any> {
    await this.delay(300);
    
    const nativeDenom = this.getNativeDenom();
    
    return {
      balances: [
        {
          denom: nativeDenom,
          amount: "10000000" // 10 tokens (assuming 6 decimals)
        },
        {
          denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          amount: "5000000" // 5 tokens (assuming 6 decimals)
        },
        {
          denom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          amount: "100000000" // 100 tokens (assuming 6 decimals)
        }
      ],
      pagination: {
        next_key: null,
        total: "3"
      }
    };
  }

  private processBalances(response: any, address: string): WalletBalanceImportRecordV1[] {
    return response.balances.map((balance: any) => this.formatBalance(balance, address, response));
  }

  private formatBalance(
    balance: any,
    address: string,
    response: any
  ): WalletBalanceImportRecordV1 {
    const denom = balance.denom;
    const amount = balance.amount;
    
    let ticker: string;
    let formattedAmount: string;
    
    if (denom === this.getNativeDenom()) {
      ticker = this.nativeTicker;
      formattedAmount = (parseInt(amount) / 1000000).toString();
    } else if (denom.startsWith('ibc/')) {
      ticker = `IBC-${denom.substring(4, 10)}`;
      formattedAmount = (parseInt(amount) / 1000000).toString();
    } else if (denom.startsWith('gravity')) {
      const ethAddress = denom.substring(7);
      ticker = this.getTickerFromEthAddress(ethAddress);
      formattedAmount = (parseInt(amount) / 1000000).toString();
    } else {
      ticker = denom.toUpperCase();
      formattedAmount = (parseInt(amount) / 1000000).toString();
    }
    
    return {
      Ticker: ticker,
      Amount: formattedAmount,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: `${this.chainName} REST API (Mock)`,
        chain: this.chainName,
        raw_response: {
          denom: denom,
          original_amount: amount,
          mockData: true
        }
      }
    };
  }

  private getTickerFromEthAddress(ethAddress: string): string {
    const addressToTicker: Record<string, string> = {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI'
    };
    
    return addressToTicker[ethAddress] || `ETH-${ethAddress.substring(0, 6)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
