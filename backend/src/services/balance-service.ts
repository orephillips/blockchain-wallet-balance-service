import { AdapterRegistry } from './adapter-registry';
import { WalletBalanceImportRecordV1, BalanceResponse } from '../models/types';
import { BigQueryService } from './bigquery-service';

export class BalanceService {
  private bigQueryService: BigQueryService;
  
  constructor() {
    this.bigQueryService = new BigQueryService();
  }
  
  async fetchBalances(chainId: string, address: string): Promise<BalanceResponse> {
    const adapter = AdapterRegistry.getAdapterForChain(chainId);
    
    if (!adapter) {
      return {
        success: false,
        data: [],
        errors: [`No adapter found for chain ID: ${chainId}`]
      };
    }
    
    try {
      const balances = await adapter.getBalances(chainId, address);
      
      await this.bigQueryService.insertBalances(balances);
      
      return {
        success: true,
        data: balances
      };
    } catch (error) {
      console.error('Error fetching balances:', error);
      return {
        success: false,
        data: [],
        errors: [(error as Error).message]
      };
    }
  }
  
  async fetchNativeBalance(chainId: string, address: string): Promise<BalanceResponse> {
    const adapter = AdapterRegistry.getAdapterForChain(chainId);
    
    if (!adapter) {
      return {
        success: false,
        data: [],
        errors: [`No adapter found for chain ID: ${chainId}`]
      };
    }
    
    try {
      const balance = await adapter.getNativeBalance(chainId, address);
      
      await this.bigQueryService.insertBalances([balance]);
      
      return {
        success: true,
        data: [balance]
      };
    } catch (error) {
      console.error('Error fetching native balance:', error);
      return {
        success: false,
        data: [],
        errors: [(error as Error).message]
      };
    }
  }
  
  async fetchERC20Balances(chainId: string, address: string): Promise<BalanceResponse> {
    const adapter = AdapterRegistry.getAdapterForChain(chainId);
    
    if (!adapter) {
      return {
        success: false,
        data: [],
        errors: [`No adapter found for chain ID: ${chainId}`]
      };
    }
    
    try {
      const balances = await adapter.getERC20Balances(chainId, address);
      
      await this.bigQueryService.insertBalances(balances);
      
      return {
        success: true,
        data: balances
      };
    } catch (error) {
      console.error('Error fetching ERC20 balances:', error);
      return {
        success: false,
        data: [],
        errors: [(error as Error).message]
      };
    }
  }
  
  async fetchERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<BalanceResponse> {
    const adapter = AdapterRegistry.getAdapterForChain(chainId);
    
    if (!adapter) {
      return {
        success: false,
        data: [],
        errors: [`No adapter found for chain ID: ${chainId}`]
      };
    }
    
    try {
      const balance = await adapter.getERC20Balance(chainId, address, tokenAddress);
      
      await this.bigQueryService.insertBalances([balance]);
      
      return {
        success: true,
        data: [balance]
      };
    } catch (error) {
      console.error('Error fetching specific ERC20 balance:', error);
      return {
        success: false,
        data: [],
        errors: [(error as Error).message]
      };
    }
  }
  
  getSupportedChains() {
    return AdapterRegistry.getSupportedChains();
  }
}
