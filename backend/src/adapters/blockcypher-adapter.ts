import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class BlockCypherAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;
  private readonly ticker: string;

  constructor(chainName: string = 'Litecoin', ticker: string = 'LTC') {
    super();
    this.chainName = chainName;
    this.ticker = ticker;
    this.baseUrl = 'https://api.blockcypher.com/v1/ltc/main';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`BlockCypher API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in BlockCypher getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`BlockCypher API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const response = await this.fetchAddressBalance(address);
      
      return this.processNativeBalance(response, address);
    } catch (error) {
      console.error('Error in BlockCypher getNativeBalance:', error);
      throw error;
    }
  }
  
  private async fetchAddressBalance(address: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/addrs/${address}`;
      const response = await axios.get(url);
      
      if (!response.data || !response.data.final_balance) {
        throw new Error('Invalid response from BlockCypher API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching address balance from BlockCypher API:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`BlockCypher API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in BlockCypher getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`BlockCypher API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens not supported for Litecoin');
    } catch (error) {
      console.error('Error in BlockCypher getERC20Balance:', error);
      throw error;
    }
  }


  private processNativeBalance(response: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInSatoshis = response.final_balance;
    const balance = (balanceInSatoshis / 100000000).toString();
    
    let blockId = '0';
    if (response.txrefs && response.txrefs.length > 0) {
      blockId = response.txrefs[0].block_height.toString();
    }
    
    return {
      Ticker: this.ticker,
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: blockId,
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'BlockCypher API',
        chain: this.chainName,
        raw_response: response
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
