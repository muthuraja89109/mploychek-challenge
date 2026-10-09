import dotenv from 'dotenv';

// Reads the ".env" file into process.env
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mploychek',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
};
