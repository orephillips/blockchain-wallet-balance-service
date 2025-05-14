import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class AgoricAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;
  private readonly nativeTicker: string;

  constructor() {
    super();
    this.chainName = 'Agoric';
    this.baseUrl = 'https://agoric-api.polkachu.com/cosmos/bank/v1beta1';
    this.nativeTicker = 'BLD';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Agoric API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      return this.processBalances(mockResponse, address);
    } catch (error) {
      console.error('Error in Agoric getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Agoric API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const nativeBalance = mockResponse.balances.find((b: any) => 
        b.denom === this.getNativeDenom()
      );
      
      if (!nativeBalance) {
        throw new Error(`Native ${this.nativeTicker} balance not found`);
      }
      
      return this.formatBalance(nativeBalance, address, mockResponse);
    } catch (error) {
      console.error('Error in Agoric getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Agoric API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const tokenBalances = mockResponse.balances.filter((b: any) => 
        b.denom !== this.getNativeDenom()
      );
      
      return tokenBalances.map((balance: any) => this.formatBalance(balance, address, mockResponse));
    } catch (error) {
      console.error('Error in Agoric getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Agoric API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockBalances(address);
      
      const tokenBalance = mockResponse.balances.find((b: any) => b.denom === tokenAddress);
      
      if (!tokenBalance) {
        throw new Error(`Token ${tokenAddress} not found for account ${address}`);
      }
      
      return this.formatBalance(tokenBalance, address, mockResponse);
    } catch (error) {
      console.error('Error in Agoric getERC20Balance:', error);
      throw error;
    }
  }

  private getNativeDenom(): string {
    return 'ubld'; // micro BLD
  }

  private async getMockBalances(address: string): Promise<any> {
    await this.delay(300);
    
    return {
      balances: [
        {
          denom: 'ubld',
          amount: '10000000' // 10 BLD (assuming 6 decimals)
        },
        {
          denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
          amount: '5000000' // 5 tokens (assuming 6 decimals)
        },
        {
          denom: 'uist',
          amount: '100000000' // 100 IST (assuming 6 decimals)
        }
      ],
      pagination: {
        next_key: null,
        total: '3'
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
    
    if (denom === 'ubld') {
      ticker = 'BLD';
      formattedAmount = (parseInt(amount) / 1000000).toString();
    } else if (denom === 'uist') {
      ticker = 'IST';
      formattedAmount = (parseInt(amount) / 1000000).toString();
    } else if (denom.startsWith('ibc/')) {
      ticker = `IBC-${denom.substring(4, 10)}`;
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
        source: 'Agoric API',
        chain: this.chainName,
        raw_response: {
          denom: denom,
          original_amount: amount,
          mockData: true
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
