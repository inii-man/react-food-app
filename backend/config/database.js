import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Use PostgreSQL in production, SQLite in development
const sequelize = process.env.DB_DIALECT === 'postgres' 
  ? new Sequelize(
      process.env.DB_NAME || 'foodapp',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false
    });

export { sequelize };

