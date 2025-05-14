import { BigQuery } from '@google-cloud/bigquery';
import { WalletBalanceImportRecordV1 } from '../models/types';

export class BigQueryService {
  private bigquery: BigQuery;
  private dataset: string;
  private table: string;
  
  constructor() {
    this.bigquery = new BigQuery();
    this.dataset = process.env.BIGQUERY_DATASET || 'blockchain_data';
    this.table = process.env.BIGQUERY_TABLE || 'wallet_balances';
  }
  
  async insertBalances(balances: WalletBalanceImportRecordV1[]): Promise<void> {
    if (!balances || balances.length === 0) {
      return;
    }
    
    try {
      console.log(`[BigQuery] Would insert ${balances.length} records into ${this.dataset}.${this.table}`);
      
      /*
      const rows = balances.map(balance => {
        return {
          ticker: balance.Ticker,
          amount: balance.Amount,
          wallet_id: balance.WalletId,
          remote_wallet_id: balance.RemoteWalletId,
          block_id: balance.BlockId,
          timestamp_sec: balance.TimestampSEC,
          raw_metadata: JSON.stringify(balance.RawMetadata)
        };
      });
      
      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(rows);
      */
      
    } catch (error) {
      console.error('Error inserting data into BigQuery:', error);
      throw error;
    }
  }
  
  async ensureTableExists(): Promise<void> {
    try {
      const [datasetExists] = await this.bigquery
        .dataset(this.dataset)
        .exists();
        
      if (!datasetExists) {
        console.log(`Creating dataset: ${this.dataset}`);
        await this.bigquery.createDataset(this.dataset);
      }
      
      const [tableExists] = await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .exists();
        
      if (!tableExists) {
        console.log(`Creating table: ${this.table}`);
        
        const schema = [
          { name: 'ticker', type: 'STRING' },
          { name: 'amount', type: 'STRING' },
          { name: 'wallet_id', type: 'STRING' },
          { name: 'remote_wallet_id', type: 'STRING' },
          { name: 'block_id', type: 'STRING' },
          { name: 'timestamp_sec', type: 'STRING' },
          { name: 'raw_metadata', type: 'STRING' }
        ];
        
        await this.bigquery
          .dataset(this.dataset)
          .createTable(this.table, { schema });
      }
    } catch (error) {
      console.error('Error ensuring BigQuery table exists:', error);
      throw error;
    }
  }
}
