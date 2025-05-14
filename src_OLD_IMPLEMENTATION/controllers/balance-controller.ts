import { Request, Response } from 'express';
import { BalanceService } from '../services/balance-service';

export class BalanceController {
  public balanceService: BalanceService;
  
  constructor() {
    this.balanceService = new BalanceService();
  }
  
  async getBalances(req: Request, res: Response): Promise<void> {
    const { chainId, address } = req.params;
    
    if (!chainId || !address) {
      res.status(400).json({
        success: false,
        message: 'Chain ID and address are required'
      });
      return;
    }
    
    try {
      const result = await this.balanceService.fetchBalances(chainId, address);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in getBalances controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
  
  async getNativeBalance(req: Request, res: Response): Promise<void> {
    const { chainId, address } = req.params;
    
    if (!chainId || !address) {
      res.status(400).json({
        success: false,
        message: 'Chain ID and address are required'
      });
      return;
    }
    
    try {
      const result = await this.balanceService.fetchNativeBalance(chainId, address);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in getNativeBalance controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
  
  async getERC20Balances(req: Request, res: Response): Promise<void> {
    const { chainId, address } = req.params;
    
    if (!chainId || !address) {
      res.status(400).json({
        success: false,
        message: 'Chain ID and address are required'
      });
      return;
    }
    
    try {
      const result = await this.balanceService.fetchERC20Balances(chainId, address);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in getERC20Balances controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
  
  async getERC20Balance(req: Request, res: Response): Promise<void> {
    const { chainId, address, tokenAddress } = req.params;
    
    if (!chainId || !address || !tokenAddress) {
      res.status(400).json({
        success: false,
        message: 'Chain ID, address, and token address are required'
      });
      return;
    }
    
    try {
      const result = await this.balanceService.fetchERC20Balance(chainId, address, tokenAddress);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in getERC20Balance controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
  
  getSupportedChains(req: Request, res: Response): void {
    try {
      const chains = this.balanceService.getSupportedChains();
      res.status(200).json({
        success: true,
        data: chains
      });
    } catch (error) {
      console.error('Error in getSupportedChains controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }
}
