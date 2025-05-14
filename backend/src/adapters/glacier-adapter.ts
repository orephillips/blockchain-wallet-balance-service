import axios from 'axios';
import { BaseAdapter } from './base-adapter';
import { WalletBalanceImportRecordV1, NativeBalance, TokenBalance } from '../models/types';

export class GlacierBalanceAdapter extends BaseAdapter {
  private readonly chainName: string;
  private readonly apiUrl: string;

  constructor() {
    super();
    this.chainName = 'Avalanche C-Chain';
    this.apiUrl = 'https://api.avax.network/ext/bc/C/rpc';
  }

  async getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Avalanche API: Fetching all balances for ${address} on chain ${chainId}`);
      
      const balances: WalletBalanceImportRecordV1[] = [];
      
      const nativeBalance = await this.getNativeBalance(chainId, address);
      balances.push(nativeBalance);
      
      
      return balances;
    } catch (error) {
      console.error(`Error in Avalanche getBalances:`, error);
      throw error;
    }
  }

  async getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Avalanche API: Fetching native balance for ${address} on chain ${chainId}`);
      
      const nativeBalance = await this.fetchNativeBalance(address);
      const blockHeight = await this.fetchCurrentBlockHeight();
      
      return this.processNativeBalance(
        nativeBalance,
        chainId,
        address,
        blockHeight,
        { nativeBalance }
      );
    } catch (error) {
      console.error(`Error in Avalanche getNativeBalance:`, error);
      throw error;
    }
  }
  
  private async fetchNativeBalance(address: string): Promise<NativeBalance> {
    try {
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      });
      
      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
      }
      
      const balanceInWei = response.data.result;
      const balanceInAvax = (parseInt(balanceInWei, 16) / 1e18).toString();
      
      return {
        balance: balanceInAvax,
        balanceRaw: parseInt(balanceInWei, 16).toString()
      };
    } catch (error) {
      console.error('Error fetching native balance from Avalanche API:', error);
      throw error;
    }
  }
  
  private async fetchCurrentBlockHeight(): Promise<string> {
    try {
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      });
      
      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
      }
      
      return parseInt(response.data.result, 16).toString();
    } catch (error) {
      console.error('Error fetching current block height from Avalanche API:', error);
      return '0'; // Default to 0 if we can't get the current block height
    }
  }

  async getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]> {
    try {
      console.log(`Avalanche API: Fetching ERC20 balances for ${address} on chain ${chainId}`);
      
      console.warn(`Avalanche API: Getting all token balances requires token addresses in advance. Use getERC20Balance with specific token addresses.`);
      
      return [];
    } catch (error) {
      console.error(`Error in Avalanche getERC20Balances:`, error);
      throw error;
    }
  }

  async getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1> {
    try {
      console.log(`Avalanche API: Fetching ERC20 balance for token ${tokenAddress}, address ${address} on chain ${chainId}`);
      
      const tokenMetadata = await this.fetchTokenMetadata(tokenAddress);
      const tokenBalance = await this.fetchTokenBalance(address, tokenAddress, tokenMetadata.decimals);
      const blockHeight = await this.fetchCurrentBlockHeight();
      
      return this.formatTokenBalance(
        {
          symbol: tokenMetadata.symbol,
          name: tokenMetadata.name,
          balance: tokenBalance.balance,
          balanceRaw: tokenBalance.balanceRaw,
          address: tokenAddress,
          decimals: tokenMetadata.decimals
        },
        chainId,
        address,
        blockHeight,
        { tokenAddress, tokenMetadata, tokenBalance }
      );
    } catch (error) {
      console.error(`Error in Avalanche getERC20Balance:`, error);
      throw error;
    }
  }
  
  private async fetchTokenBalance(address: string, tokenAddress: string, decimals: number): Promise<{balance: string, balanceRaw: string}> {
    try {
      const data = `0x70a08231000000000000000000000000${address.replace('0x', '')}`;
      
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: data
        }, 'latest'],
        id: 1
      });
      
      if (response.data.error) {
        throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
      }
      
      const balanceRaw = response.data.result === '0x' ? '0' : parseInt(response.data.result, 16).toString();
      const balance = (parseInt(balanceRaw) / Math.pow(10, decimals)).toString();
      
      return {
        balance,
        balanceRaw
      };
    } catch (error) {
      console.error(`Error fetching token balance from Avalanche API:`, error);
      throw error;
    }
  }
  
  private async fetchTokenMetadata(tokenAddress: string): Promise<{symbol: string, name: string, decimals: number}> {
    try {
      let symbol = `TOKEN-${tokenAddress.substring(0, 6)}`;
      let name = 'Unknown Token';
      let decimals = 18;
      
      try {
        const symbolResponse = await axios.post(this.apiUrl, {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: tokenAddress,
            data: '0x95d89b41'
          }, 'latest'],
          id: 1
        });
        
        if (!symbolResponse.data.error && symbolResponse.data.result && symbolResponse.data.result !== '0x') {
          const hexData = symbolResponse.data.result.slice(2); // Remove 0x prefix
          const stringLength = parseInt(hexData.slice(64, 128), 16); // Get the string length
          const symbolHex = hexData.slice(128, 128 + stringLength * 2); // Get the actual string data
          
          let tempSymbol = '';
          for (let i = 0; i < symbolHex.length; i += 2) {
            tempSymbol += String.fromCharCode(parseInt(symbolHex.substr(i, 2), 16));
          }
          
          if (tempSymbol) {
            symbol = tempSymbol;
          }
        }
        
        const nameResponse = await axios.post(this.apiUrl, {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: tokenAddress,
            data: '0x06fdde03'
          }, 'latest'],
          id: 1
        });
        
        if (!nameResponse.data.error && nameResponse.data.result && nameResponse.data.result !== '0x') {
          const hexData = nameResponse.data.result.slice(2); // Remove 0x prefix
          const stringLength = parseInt(hexData.slice(64, 128), 16); // Get the string length
          const nameHex = hexData.slice(128, 128 + stringLength * 2); // Get the actual string data
          
          let tempName = '';
          for (let i = 0; i < nameHex.length; i += 2) {
            tempName += String.fromCharCode(parseInt(nameHex.substr(i, 2), 16));
          }
          
          if (tempName) {
            name = tempName;
          }
        }
        
        const decimalsResponse = await axios.post(this.apiUrl, {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: tokenAddress,
            data: '0x313ce567'
          }, 'latest'],
          id: 1
        });
        
        if (!decimalsResponse.data.error && decimalsResponse.data.result && decimalsResponse.data.result !== '0x') {
          decimals = parseInt(decimalsResponse.data.result, 16);
        }
      } catch (error) {
        console.warn(`Error fetching token metadata for ${tokenAddress}:`, error);
      }
      
      return { symbol, name, decimals };
    } catch (error) {
      console.error(`Error in fetchTokenMetadata:`, error);
      return { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 };
    }
  }


  private processNativeBalance(
    nativeBalance: NativeBalance,
    chainId: string,
    address: string,
    blockHeight: string,
    rawResponse: any
  ): WalletBalanceImportRecordV1 {
    return {
      Ticker: 'AVAX',
      Amount: nativeBalance.balance || '0',
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: blockHeight,
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Avalanche API',
        chain: this.chainName,
        raw_response: rawResponse
      }
    };
  }

  private formatTokenBalance(
    token: TokenBalance,
    chainId: string,
    address: string,
    blockHeight: string,
    rawResponse: any
  ): WalletBalanceImportRecordV1 {
    return {
      Ticker: token.symbol || 'UNKNOWN',
      Amount: token.balance || '0',
      WalletId: this.formatWalletId(address),
      RemoteWalletId: address,
      BlockId: blockHeight,
      TimestampSEC: this.getCurrentTimestamp(),
      RawMetadata: {
        source: 'Avalanche API',
        chain: this.chainName,
        raw_response: rawResponse
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
