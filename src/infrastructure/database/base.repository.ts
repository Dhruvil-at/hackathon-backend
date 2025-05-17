import { PoolConnection } from 'mysql2/promise';
import { MySQLConnection } from './mysql.connection';

/**
 * Base repository class to be extended by all repository implementations
 */
export abstract class BaseRepository {
  protected db: MySQLConnection;

  constructor() {
    this.db = MySQLConnection.getInstance();
  }

  /**
   * Execute a query with parameters
   */
  protected async executeQuery<R>(queryName: string, sql: string, params?: any[]): Promise<R> {
    const startTime = performance.now();
    try {
      console.debug(`Executing query: ${queryName}`);
      const result = await this.db.query<R>(sql, params);

      const duration = performance.now() - startTime;
      console.debug(`Query ${queryName} completed in ${duration}ms`);

      return result;
    } catch (error) {
      console.error(`Query ${queryName} failed:`, error);
      throw new Error(`Failed to execute query: ${queryName}`);
    }
  }

  /**
   * Execute a transaction with a callback function
   */
  protected async executeTransaction<R>(
    transactionName: string,
    callback: (connection: PoolConnection) => Promise<R>,
  ): Promise<R> {
    const startTime = performance.now();
    try {
      console.debug(`Starting transaction: ${transactionName}`);
      const result = await this.db.transaction(callback);

      const duration = performance.now() - startTime;
      console.debug(`Transaction ${transactionName} completed in ${duration}ms`);

      return result;
    } catch (error) {
      console.error(`Transaction ${transactionName} failed:`, error);
      throw new Error(`Failed to execute transaction: ${transactionName}`);
    }
  }

  /**
   * Helper function to calculate pagination offset
   */
  protected calculateOffset(page: number, limit: number): number {
    return (Math.max(1, page) - 1) * limit;
  }
}
