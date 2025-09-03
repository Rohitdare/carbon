const http = require('http');
const { db } = require('./src/config/database');
const { getRedisClient } = require('./src/config/redis');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 8000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

async function checkDatabase() {
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

async function checkRedis() {
  try {
    const redisClient = getRedisClient();
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

async function healthCheck() {
  const dbHealthy = await checkDatabase();
  const redisHealthy = await checkRedis();
  
  if (dbHealthy && redisHealthy) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

healthCheck();

