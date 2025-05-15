import 'dotenv/config';
import App from './app';

const init = async (): Promise<void> => {
  try {
    const app = new App();
    app.listen();
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

init();
