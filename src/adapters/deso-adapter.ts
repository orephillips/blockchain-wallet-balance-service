import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class DesoAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Deso';
    this.baseUrl = 'https://api.deso.org/api/v0';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Deso API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const userInfo = await this.getMockUserInfo(address);
      
      return [this.formatNativeBalance(userInfo, address)];
    } catch (error) {
      console.error('Error in Deso getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Deso API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const userInfo = await this.getMockUserInfo(address);
      
      return this.formatNativeBalance(userInfo, address);
    } catch (error) {
      console.error('Error in Deso getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Deso API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Deso getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Deso API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens are not supported on Deso');
    } catch (error) {
      console.error('Error in Deso getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockUserInfo(address: string): Promise<any> {
    await this.delay(300);
    
    const publicKey = this.formatPublicKey(address);
    
    return {
      UserList: [
        {
          PublicKeyBase58Check: publicKey,
          ProfileEntryResponse: {
            Username: "desouser",
            Description: "Deso user profile",
            CoinEntry: {
              CreatorBasisPoints: 1000,
              NumberOfHolders: 5,
              CoinsInCirculationNanos: 1000000000
            }
          },
          Balances: {
            DESO: {
              BalanceNanos: 5000000000, // 5 DESO in nanos
              UnconfirmedBalanceNanos: 0
            }
          },
          UsersYouHODL: [],
          UsersWhoHODLYou: []
        }
      ]
    };
  }

  private formatPublicKey(address: string): string {
    if (address.startsWith('BC1')) {
      return address;
    }
    
    return 'BC1YLg38KgfyDfuUd9NkjrGuuMjBUWth3CbaKygp3XEjov8ZyUUKqTV';
  }

  private formatNativeBalance(userInfo: any, address: string): WalletBalanceImportRecordV1 {
    const user = userInfo.UserList[0];
    
    const balanceInDESO = (user.Balances.DESO.BalanceNanos / 1e9).toString();
    
    return {
      Ticker: 'DESO',
      Amount: balanceInDESO,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: user.PublicKeyBase58Check,
      BlockId: '0', // Block height not provided in this response
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Deso API',
        chain: this.chainName,
        raw_response: {
          publicKey: user.PublicKeyBase58Check,
          username: user.ProfileEntryResponse?.Username,
          balanceNanos: user.Balances.DESO.BalanceNanos,
          mockData: true
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
