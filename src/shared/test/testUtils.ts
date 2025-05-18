import 'dotenv/config';
import { expect } from '@jest/globals';
import request from 'supertest';
import mysql from 'mysql2/promise';
import { JwtServiceFactory } from '../../shared/jwt';
import { UserRole } from '../../modules/auth/domain/interfaces/userRoles';
import App from '../../app';

// Set database name explicitly to hackathon_test for safety
process.env.MYSQL_DATABASE = 'hackathon_test';

// Create test server instance
export const app = new App().getServer();
export const testServer = request(app);

// Create JWT tokens
export const jwtService = JwtServiceFactory.create();

// Generate admin JWT payload
export const ADMIN_PAYLOAD = {
  id: 999,
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  firstName: 'Admin',
  lastName: 'User',
  fullName: 'Admin User',
  teamId: null,
};

// Generate regular user JWT payload
export const REGULAR_USER_PAYLOAD = {
  id: 998,
  email: 'user@example.com',
  role: UserRole.TEAM_MEMBER,
  firstName: 'Regular',
  lastName: 'User',
  fullName: 'Regular User',
  teamId: 1,
};

// Generate JWT tokens
export const ADMIN_TOKEN = jwtService.generateToken(ADMIN_PAYLOAD);
export const USER_TOKEN = jwtService.generateToken(REGULAR_USER_PAYLOAD);

// Helper function to make authenticated requests with specified token
export const authenticatedRequest = (request: request.Test, token: string): request.Test => {
  if (token) {
    return request.set('Authorization', `Bearer ${token}`);
  }
  return request;
};

// Database connection utility
export const createTestDatabaseConnection = async (): Promise<mysql.Connection> => {
  // Create a direct connection to the test database
  const connection = await mysql.createConnection({
    host:
      process.env.MYSQL_HOST || 'SG-avesta-hackathon-12569-mysql-master.servers.mongodirector.com',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'sgroot',
    password: process.env.MYSQL_PASSWORD || 'EZkf3w4y8Z@Ydl96',
    database: 'hackathon_test', // Explicitly connect to test database
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Verify we're connected to the test database
  const [rows] = await connection.execute<mysql.RowDataPacket[]>('SELECT database() as current_db');
  console.log('CONNECTED TO DATABASE:', rows[0].current_db);

  if (rows[0].current_db !== 'hackathon_test') {
    throw new Error(`Not connected to test database. Connected to: ${rows[0].current_db}`);
  }

  // Create required tables for tests
  await createTableIfNotExists(
    connection,
    'user',
    `CREATE TABLE IF NOT EXISTS user (
      id VARCHAR(36) PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      teamId INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  );

  await createTableIfNotExists(
    connection,
    'teams',
    `CREATE TABLE IF NOT EXISTS teams (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  );

  await createTableIfNotExists(
    connection,
    'categories',
    `CREATE TABLE IF NOT EXISTS categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  );

  return connection;
};

// Helper function to create a table if it doesn't exist
export const createTableIfNotExists = async (
  connection: mysql.Connection,
  tableName: string,
  createTableSQL: string,
): Promise<void> => {
  try {
    await connection.execute(createTableSQL);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.error(`Error creating ${tableName} table:`, error);
    throw error;
  }
};

// Common test verification helpers
export const verifySuccessResponse = (response: any): void => {
  expect(response.body).toEqual(
    expect.objectContaining({
      success: true,
      message: expect.any(String),
      data: expect.any(Object),
    }),
  );
};

export const verifyErrorResponse = (response: any, errorPattern: RegExp): void => {
  expect(response.body).toEqual(
    expect.objectContaining({
      success: false,
      message: expect.stringMatching(errorPattern),
    }),
  );
};
