const Redis = require('ioredis');

let redisClient;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on('connect', () => {
    console.log('Redis Connected');
  });

  redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
  });
} else {
  console.warn('REDIS_URL not provided, Redis functionality might be limited.');
}

module.exports = redisClient;
