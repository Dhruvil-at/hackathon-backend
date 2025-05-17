import mysql, { Pool, PoolOptions, PoolConnection } from 'mysql2/promise';

/**
 * MySQL connection service - responsible for managing database connections
 */
export class MySQLConnection {
  private pool: Pool;
  private static instance: MySQLConnection;

  private constructor() {
    const config: PoolOptions = {
      host:
        process.env.MYSQL_HOST ||
        'SG-avesta-hackathon-12569-mysql-master.servers.mongodirector.com',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'sgroot',
      password: process.env.MYSQL_PASSWORD || 'EZkf3w4y8Z@Ydl96',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // SSL configuration for secure connection
      ssl: {
        rejectUnauthorized: false, // Set to true in production with proper certificates
      },
    };

    this.pool = mysql.createPool(config);
    console.log(`MySQL connection pool created for ${config.host}:${config.port}`);
  }

  /**
   * Get singleton instance of MySQL connection
   */
  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }

  /**
   * Get a connection from the pool
   */
  public async getConnection(): Promise<PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.error('Error getting MySQL connection:', error);
      throw new Error('Failed to get database connection');
    }
  }

  /**
   * Execute a query with params
   */
  public async query<T>(sql: string, params?: any[]): Promise<T> {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.getConnection();
      const [results] = await connection.query(sql, params);
      return results as T;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new Error('Database query failed');
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  public async transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.getConnection();
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Transaction failed:', error);
      throw new Error('Database transaction failed');
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Close the connection pool
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('MySQL connection pool closed');
    } catch (error) {
      console.error('Error closing MySQL connection pool:', error);
      throw new Error('Failed to close database connection pool');
    }
  }
}
