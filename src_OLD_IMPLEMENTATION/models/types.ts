
export interface WalletBalanceImportRecordV1 {
  Ticker: string;
  Amount: string;
  WalletId: string;
  RemoteWalletId: string;
  BlockId: string;
  TimestampSEC: string;
  RawMetadata: {
    source: string;
    chain: string;
    raw_response: any;
  };
}

export interface BalanceResponse {
  success: boolean;
  data: WalletBalanceImportRecordV1[];
  errors?: string[];
}

export interface ChainConfig {
  name: string;
  chainId: string;
  provider: string;
}

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: string;
}

export interface NativeBalance {
  balance: string;
  balanceRaw: string;
}
