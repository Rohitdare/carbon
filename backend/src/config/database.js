const knex = require('knex');
const { logger } = require('../utils/logger');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'blue_carbon_mrv',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './database/migrations'
  },
  seeds: {
    directory: './database/seeds'
  }
};

const db = knex(config);

async function connectDatabase() {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
    
    // Enable PostGIS extension
    await db.raw('CREATE EXTENSION IF NOT EXISTS postgis');
    logger.info('✅ PostGIS extension enabled');
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

module.exports = {
  db,
  connectDatabase
};

