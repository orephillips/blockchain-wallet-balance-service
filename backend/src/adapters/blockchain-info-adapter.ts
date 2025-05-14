import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class BlockchainInfoAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.chainName = 'Bitcoin';
    this.baseUrl = 'https://blockchain.info';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blockchain.info API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      
      return [nativeBalance];
    } catch (error) {
      console.error('Error in Blockchain.info getBalances:', error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blockchain.info API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const mockResponse = await this.getMockAddressInfo(address);
      
      return this.processNativeBalance(mockResponse, address);
    } catch (error) {
      console.error('Error in Blockchain.info getNativeBalance:', error);
      throw error;
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Blockchain.info API: Fetching token balances for ${address} on chain ${chainId}`);
      
      return [];
    } catch (error) {
      console.error('Error in Blockchain.info getERC20Balances:', error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Blockchain.info API: Fetching token balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      throw new Error('ERC20 tokens not supported for Bitcoin');
    } catch (error) {
      console.error('Error in Blockchain.info getERC20Balance:', error);
      throw error;
    }
  }

  private async getMockAddressInfo(address: string): Promise<any> {
    await this.delay(300);
    
    return {
      hash160: "94c5e6f8b52c1537c77a6a5c7f4ea6f6a68a6f6a",
      address: address,
      n_tx: 10,
      n_unredeemed: 0,
      total_received: 1200000000, // 12 BTC in satoshis
      total_sent: 700000000, // 7 BTC in satoshis
      final_balance: 500000000, // 5 BTC in satoshis
      txs: [
        {
          hash: "f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16",
          ver: 1,
          vin_sz: 1,
          vout_sz: 2,
          size: 258,
          weight: 1032,
          fee: 0,
          relayed_by: "0.0.0.0",
          lock_time: 0,
          tx_index: 1234567,
          double_spend: false,
          time: 1231467935,
          block_index: 170,
          block_height: 170,
          inputs: [
            {
              sequence: 4294967295,
              witness: "",
              script: "...",
              index: 0,
              prev_out: {
                spent: true,
                script: "...",
                spending_outpoints: [
                  {
                    tx_index: 1234567,
                    n: 0
                  }
                ],
                tx_index: 1234566,
                value: 5000000000,
                addr: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
                n: 0,
                type: 0
              }
            }
          ],
          out: [
            {
              type: 0,
              spent: true,
              value: 1000000000,
              spending_outpoints: [
                {
                  tx_index: 1234568,
                  n: 0
                }
              ],
              n: 0,
              tx_index: 1234567,
              script: "...",
              addr: address
            },
            {
              type: 0,
              spent: false,
              value: 4000000000,
              spending_outpoints: [],
              n: 1,
              tx_index: 1234567,
              script: "...",
              addr: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
            }
          ]
        }
      ]
    };
  }

  private processNativeBalance(response: any, address: string): WalletBalanceImportRecordV1 {
    const balanceInSatoshis = response.final_balance;
    const balance = (balanceInSatoshis / 100000000).toString();
    
    let blockId = '0';
    if (response.txs && response.txs.length > 0) {
      blockId = response.txs[0].block_height.toString();
    }
    
    return {
      Ticker: 'BTC',
      Amount: balance,
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: blockId,
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Blockchain.info API',
        chain: this.chainName,
        raw_response: response
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
