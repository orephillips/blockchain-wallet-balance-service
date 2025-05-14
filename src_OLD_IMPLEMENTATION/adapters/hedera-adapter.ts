import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class HederaAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Hedera';
    this.baseUrl = 'https://mainnet-public.mirrornode.hedera.com/api/v1';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Hedera API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      const balances: WalletBalanceImportRecordV1[] = [];
      
      if (accountInfo.balance && accountInfo.balance.balance) {
        balances.push(this.processNativeBalance(accountInfo, address));
      }
      
      if (accountInfo.balance && accountInfo.balance.tokens) {
        const tokenBalances = accountInfo.balance.tokens.map((token: any) => 
          this.formatTokenBalance(token, address, accountInfo)
        );
        balances.push(...tokenBalances);
      }
      
      return balances;
    } catch (error) {
      console.error('Error in Hedera getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Hedera API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      return this.processNativeBalance(accountInfo, address);
    } catch (error) {
      console.error('Error in Hedera getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Hedera API: Fetching token balances for ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      if (!accountInfo.balance || !accountInfo.balance.tokens) {
        return [];
      }
      
      return accountInfo.balance.tokens.map((token: any) => 
        this.formatTokenBalance(token, address, accountInfo)
      );
    } catch (error) {
      console.error('Error in Hedera getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Hedera API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const accountInfo = await this.getMockAccountInfo(address);
      
      if (!accountInfo.balance || !accountInfo.balance.tokens) {
        throw new Error('No token balances found');
      }
      
      const token = accountInfo.balance.tokens.find((t: any) => t.token_id === tokenAddress);
      
      if (!token) {
        throw new Error(`Token ${tokenAddress} not found for account ${address}`);
      }
      
      return this.formatTokenBalance(token, address, accountInfo);
    } catch (error) {
      console.error('Error in Hedera getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockAccountInfo(address: string): Promise<any> {
    await this.delay(300);
    
    const hederaAddress = this.formatHederaAddress(address);
    
    return {
      account: hederaAddress,
      balance: {
        balance: 5000000000, // 50 HBAR (in tinybars)
        timestamp: "1617591600.000000000",
        tokens: [
          {
            token_id: "0.0.123456",
            balance: 1000,
            name: "USDC",
            symbol: "USDC",
            decimals: 6
          },
          {
            token_id: "0.0.654321",
            balance: 500,
            name: "Hedera Token Service Token",
            symbol: "HTST",
            decimals: 8
          }
        ]
      },
      key: {
        _type: "ED25519",
        key: "4a5ad514f0957fa170a676210c9bdbddf3bc9519702cf915fa6767a40463b29f"
      },
      auto_renew_period: 7776000,
      expiry_timestamp: null,
      memo: "Mirror node mock account"
    };
  }

  private formatHederaAddress(address: string): string {
    if (address.match(/^\d+\.\d+\.\d+$/)) {
      return address;
    }
    
    if (address.startsWith('0x')) {
      return '0.0.400'; // Mock Hedera account ID
    }
    
    return '0.0.400';
  }

  private processNativeBalance(accountInfo: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInTinybars = accountInfo.balance.balance;
    const balance = (balanceInTinybars / 100000000).toString();
    
    return {
      Ticker: 'HBAR',
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: accountInfo.account,
      BlockId: '0', // Hedera doesn't use block height in the same way
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Hedera Mirror Node API',
        chain: this.chainName,
        raw_response: accountInfo
      }
    };
  }

  private formatTokenBalance(
    token: any,
    address: string,
    accountInfo: any
  ): WalletBalanceImportRecordV1 {
    const balance = (token.balance / Math.pow(10, token.decimals)).toString();
    
    return {
      Ticker: token.symbol,
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: accountInfo.account,
      BlockId: '0', // Hedera doesn't use block height in the same way
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Hedera Mirror Node API',
        chain: this.chainName,
        raw_response: {
          token_id: token.token_id,
          token_name: token.name,
          mockData: true
        }
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
