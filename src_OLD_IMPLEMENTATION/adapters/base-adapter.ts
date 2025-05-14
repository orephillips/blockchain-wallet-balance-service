import { WalletBalanceImportRecordV1 } from '../models/types';

export interface BalanceAdapter {
  getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]>;
  getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1>;
  getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]>;
  getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1>;
}

export abstract class BaseAdapter implements BalanceAdapter {
  abstract getBalances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]>;
  abstract getNativeBalance(chainId: string, address: string): Promise<WalletBalanceImportRecordV1>;
  abstract getERC20Balances(chainId: string, address: string): Promise<WalletBalanceImportRecordV1[]>;
  abstract getERC20Balance(chainId: string, address: string, tokenAddress: string): Promise<WalletBalanceImportRecordV1>;

  protected getCurrentTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  protected formatWalletId(address: string): string {
    return `bitwave-wallet-id-${address.substring(0, 8)}`;
  }
}
