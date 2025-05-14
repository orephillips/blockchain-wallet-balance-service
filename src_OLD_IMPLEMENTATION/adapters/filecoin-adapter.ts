import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class FilecoinAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Filecoin';
    this.baseUrl = 'https://filfox.info/api/v1';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Filecoin API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      return [this.formatNativeBalance(accountInfo, address)];
    } catch (error) {
      console.error('Error in Filecoin getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Filecoin API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      return this.formatNativeBalance(accountInfo, address);
    } catch (error) {
      console.error('Error in Filecoin getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Filecoin API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Filecoin getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Filecoin API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens are not supported on Filecoin');
    } catch (error) {
      console.error('Error in Filecoin getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockAccountInfo(address: string): Promise<any> {
    await this.delay(300);
    
    return {
      address: address,
      balance: "1000000000000000000", // 1 FIL in attoFIL
      nonce: 42,
      actorType: "account",
      actorCode: "fil/2/account",
      timestamp: 1682287200, // Unix timestamp
      height: 2468135
    };
  }

  private formatNativeBalance(accountInfo: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInFIL = (parseInt(accountInfo.balance) / 1e18).toString();
    
    return {
      Ticker: 'FIL',
      Amount: balanceInFIL,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: accountInfo.height.toString(),
      TimestampSEC: accountInfo.timestamp.toString(),
      RawMetadata: {
        source: 'Filfox API',
        chain: this.chainName,
        raw_response: accountInfo
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
