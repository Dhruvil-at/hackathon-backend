import 'dotenv/config';
import App from './app';
import { MySQLConnection } from './infrastructure/database';

const init = async (): Promise<void> => {
  try {
    // Initialize MySQL connection
    const dbConnection = MySQLConnection.getInstance();

    // Test database connection with simple query
    try {
      await dbConnection.query('SELECT 1 AS connection_test');
      console.log('✅ MySQL connection test successful');
    } catch (dbError) {
      console.error('❌ MySQL connection test failed:', dbError);
      process.exit(1);
    }

    const app = new App();
    app.listen();
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await MySQLConnection.getInstance().close();
    console.log('Server shutting down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

init();
