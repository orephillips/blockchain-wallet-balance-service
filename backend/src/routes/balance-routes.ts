import { Router } from 'express';
import { BalanceController } from '../controllers/balance-controller';

const router = Router();
const balanceController = new BalanceController();

const API_VERSION = 'v1';

router.get(`/${API_VERSION}/chains`, (req, res) => balanceController.getSupportedChains(req, res));

router.get(`/${API_VERSION}/chains/:chainId/addresses/:address/balances`, (req, res) => 
  balanceController.getBalances(req, res)
);

router.get(`/${API_VERSION}/chains/:chainId/addresses/:address/native-balance`, (req, res) => 
  balanceController.getNativeBalance(req, res)
);

router.get(`/${API_VERSION}/chains/:chainId/addresses/:address/erc20-balances`, (req, res) => 
  balanceController.getERC20Balances(req, res)
);

router.get(`/${API_VERSION}/chains/:chainId/addresses/:address/erc20-balances/:tokenAddress`, (req, res) => 
  balanceController.getERC20Balance(req, res)
);

router.post(`/${API_VERSION}/fetch-balances`, async (req, res) => {
  const { chainId, address } = req.body;
  
  if (!chainId || !address) {
    res.status(400).json({
      success: false,
      message: 'Chain ID and address are required'
    });
    return;
  }
  
  try {
    const result = await balanceController.balanceService.fetchBalances(chainId, address);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in fetch-balances endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
});

export default router;
