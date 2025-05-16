import dotenv from 'dotenv';
import path from 'path';

// Load the appropriate .env file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${env}`);
const fallbackPath = path.resolve(process.cwd(), '.env');

// First try with environment-specific file, then fallback to default .env
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log(`No ${envPath} found, trying fallback .env file`);
  dotenv.config({ path: fallbackPath });
}

console.log(`Environment: ${env}`);
