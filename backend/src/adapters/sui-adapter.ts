import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class SuiAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'SUI';
    this.baseUrl = 'https://fullnode.mainnet.sui.io:443';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`SUI API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const balancesResponse = await this.getMockBalances(address);
      
      return this.processBalances(balancesResponse, address);
    } catch (error) {
      console.error('Error in SUI getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`SUI API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const balancesResponse = await this.getMockBalances(address);
      
      const nativeBalance = balancesResponse.result.find((b: any) => 
        b.coinType === '0x2::sui::SUI'
      );
      
      if (!nativeBalance) {
        throw new Error('Native SUI balance not found');
      }
      
      return this.formatBalance(nativeBalance, address);
    } catch (error) {
      console.error('Error in SUI getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`SUI API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const balancesResponse = await this.getMockBalances(address);
      
      const tokenBalances = balancesResponse.result.filter((b: any) => 
        b.coinType !== '0x2::sui::SUI'
      );
      
      return tokenBalances.map((balance: any) => this.formatBalance(balance, address));
    } catch (error) {
      console.error('Error in SUI getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`SUI API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const balancesResponse = await this.getMockBalances(address);
      
      const tokenBalance = balancesResponse.result.find((b: any) => b.coinType === tokenAddress);
      
      if (!tokenBalance) {
        throw new Error(`Token ${tokenAddress} not found for account ${address}`);
      }
      
      return this.formatBalance(tokenBalance, address);
    } catch (error) {
      console.error('Error in SUI getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockBalances(address: string): Promise<any> {
    await this.delay(300);
    
    return {
      jsonrpc: '2.0',
      id: 1,
      result: [
        {
          coinType: '0x2::sui::SUI',
          coinObjectCount: 5,
          totalBalance: '10000000000', // 10 SUI in MIST (1 SUI = 10^9 MIST)
          lockedBalance: {}
        },
        {
          coinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
          coinObjectCount: 1,
          totalBalance: '1000000000', // 1000 tokens (assuming 6 decimals)
          lockedBalance: {}
        },
        {
          coinType: '0x6e0bae5ac4e88e48f93d6f1f09debae0ae7b01e5f2d8a0096103f11aefc16a8d::coin::USDC',
          coinObjectCount: 1,
          totalBalance: '5000000', // 5 USDC (assuming 6 decimals)
          lockedBalance: {}
        }
      ]
    };
  }

  private processBalances(response: any, address: string): WalletBalanceImportRecordV1[] {
    return response.result.map((balance: any) => this.formatBalance(balance, address));
  }

  private formatBalance(
    balance: any,
    address: string
  ): WalletBalanceImportRecordV1 {
    const coinType = balance.coinType;
    const totalBalance = balance.totalBalance;
    
    let ticker: string;
    let formattedAmount: string;
    
    if (coinType === '0x2::sui::SUI') {
      ticker = 'SUI';
      formattedAmount = (parseInt(totalBalance) / 1e9).toString(); // Convert MIST to SUI
    } else if (coinType.includes('::USDC') || coinType.includes('::usdc')) {
      ticker = 'USDC';
      formattedAmount = (parseInt(totalBalance) / 1e6).toString(); // Assuming 6 decimals
    } else {
      const parts = coinType.split('::');
      ticker = parts.length > 2 ? parts[2] : coinType.substring(0, 10);
      formattedAmount = (parseInt(totalBalance) / 1e9).toString(); // Assuming 9 decimals by default
    }
    
    return {
      Ticker: ticker,
      Amount: formattedAmount,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'SUI API',
        chain: this.chainName,
        raw_response: {
          coinType: coinType,
          totalBalance: totalBalance,
          coinObjectCount: balance.coinObjectCount,
          mockData: true
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
