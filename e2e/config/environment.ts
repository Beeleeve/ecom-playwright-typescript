import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the correct .env file
dotenv.config({
  path: path.join(__dirname, `.env.${process.env.ENV || 'test'}`)
});

interface UserConfig {
  email?: string;
  password?: string;
}

interface AppConfig {
  baseUrl: string;
  user: UserConfig;
}

const config: AppConfig = {
  baseUrl: process.env.BASE_URL || '',
  user: {
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  },
};

if (!config.baseUrl) {
  throw new Error('BASE_URL environment variable is not set');
}

export default config;