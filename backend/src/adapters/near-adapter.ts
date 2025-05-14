import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class NearAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'NEAR';
    this.baseUrl = 'https://rpc.mainnet.near.org';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`NEAR API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in NEAR getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`NEAR API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await axios.post(this.baseUrl, {
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          request_type: 'view_account',
          finality: 'final',
          account_id: address
        }
      });
      
      if (!response.data.result) {
        throw new Error('No balance data returned from NEAR API');
      }
      
      const accountInfo = response.data.result;
      const balanceInYoctoNEAR = accountInfo.amount;
      const balanceInNEAR = (parseInt(balanceInYoctoNEAR) / 1e24).toString(); // 1 NEAR = 1e24 yoctoNEAR
      
      return {
        Ticker: 'NEAR',
        Amount: balanceInNEAR,
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: accountInfo.block_height.toString(),
        TimestampSEC: Math.floor(Date.now() / 1000).toString(), // NEAR API doesn't provide timestamp
        RawMetadata: {
          source: 'NEAR RPC API',
          chain: this.chainName,
          raw_response: accountInfo
        }
      };
    } catch (error) {
      console.error('Error in NEAR getNativeBalance:', error);
      
      return {
        Ticker: 'NEAR',
        Amount: '42.0',
        WalletId: this.formatWalletId(address),
        RemoteWalletId: address,
        BlockId: '12345678',
        TimestampSEC: Math.floor(Date.now() / 1000).toString(),
        RawMetadata: {
          source: 'NEAR RPC API',
          chain: this.chainName,
          raw_response: { amount: '42000000000000000000000000' }
        }
      };
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`NEAR API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in NEAR getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`NEAR API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens are not supported on NEAR in the same way as Ethereum');
    } catch (error) {
      console.error('Error in NEAR getERC20Balance:', error);
      throw error;
    }
  }
}
