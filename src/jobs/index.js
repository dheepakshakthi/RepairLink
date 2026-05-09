const Queue = require('bull');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const biddingExpireQueue = new Queue('bidding-expire', redisUrl);
const deliveryAdvanceQueue = new Queue('delivery-advance', redisUrl);
const ticketAutoCloseQueue = new Queue('ticket-auto-close', redisUrl);
const slaReminderQueue = new Queue('sla-reminder', redisUrl);
const otpExpireQueue = new Queue('otp-expire', redisUrl);

module.exports = {
  biddingExpireQueue,
  deliveryAdvanceQueue,
  ticketAutoCloseQueue,
  slaReminderQueue,
  otpExpireQueue
};

require('./processors');
