const { biddingExpireQueue, deliveryAdvanceQueue, ticketAutoCloseQueue, slaReminderQueue, otpExpireQueue } = require('./index');
const Ticket = require('../models/Ticket');
const Bid = require('../models/Bid');
const Delivery = require('../models/Delivery');
const NotificationService = require('../services/NotificationService');
const { getIo } = require('../config/socket');

// 1. Bidding Expire Processor
biddingExpireQueue.process(async (job) => {
  const { ticketId } = job.data;
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return;

  if (ticket.status === 'open') {
    ticket.status = 'cancelled';
    ticket.isBiddingOpen = false;
    ticket.statusHistory.push({ status: 'cancelled', changedBy: null, changedAt: new Date(), note: 'Bidding expired with 0 bids' });
    await ticket.save();

    await NotificationService.notifyCustomer(ticket.customerId, {
      type: 'system',
      title: 'Ticket Expired',
      message: `Your ticket ${ticket.ticketNo} expired with no bids.`,
      link: `/tickets/${ticket._id}`
    });
  } else if (ticket.status === 'bids_received') {
    ticket.isBiddingOpen = false;
    await ticket.save();
    
    await NotificationService.notifyCustomer(ticket.customerId, {
      type: 'system',
      title: 'Bidding Closed',
      message: `Bidding closed for ${ticket.ticketNo}. Please select a provider.`,
      link: `/tickets/${ticket._id}`
    });
  }
});

// 2. Delivery Advance Processor
deliveryAdvanceQueue.process(async (job) => {
  const { deliveryId, targetStatus } = job.data;
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) return;

  if (delivery.status === 'scheduled') {
    delivery.status = targetStatus;
    delivery.statusHistory.push({ status: targetStatus, at: new Date() });
    await delivery.save();

    const ticket = await Ticket.findById(delivery.ticketId);
    if (ticket) {
      if (delivery.leg === 'outbound') {
        ticket.status = 'device_in_transit';
        ticket.statusHistory.push({ status: 'device_in_transit', changedBy: null, changedAt: new Date() });
        await ticket.save();
      } else {
        ticket.status = 'return_in_transit';
        ticket.statusHistory.push({ status: 'return_in_transit', changedBy: null, changedAt: new Date() });
        await ticket.save();
      }

      await NotificationService.notifyDeliveryUpdate(ticket, delivery);
      try {
        getIo().to(`ticket:${ticket._id}`).emit('delivery:status-updated', { ticketId: ticket._id, delivery });
        getIo().to(`ticket:${ticket._id}`).emit('ticket:status-updated', { ticketId: ticket._id, status: ticket.status, updatedAt: new Date() });
      } catch(err) { console.error(err); }
    }
  }
});

// 3. Ticket Auto-Close Processor
ticketAutoCloseQueue.process(async (job) => {
  const { ticketId } = job.data;
  const ticket = await Ticket.findById(ticketId);
  if (ticket && ticket.status === 'delivered') {
    ticket.status = 'closed';
    ticket.statusHistory.push({ status: 'closed', changedBy: null, changedAt: new Date(), note: 'Auto-closed after 7 days' });
    await ticket.save();
  }
});

// 4. SLA Reminder Processor
slaReminderQueue.process(async (job) => {
  const { ticketId } = job.data;
  const ticket = await Ticket.findById(ticketId).populate('assignedProviderId');
  if (ticket && ['device_received', 'in_repair'].includes(ticket.status) && ticket.assignedProviderId) {
    await NotificationService.notifyProvider(ticket.assignedProviderId.userId, {
      type: 'system',
      title: 'SLA Reminder',
      message: `Ticket ${ticket.ticketNo} has been in repair for 3 days. Please update the customer.`,
      link: `/provider/jobs/${ticket._id}`
    });
  }
});

// 5. OTP Expire Processor
otpExpireQueue.process(async (job) => {
  const { deliveryId } = job.data;
  const delivery = await Delivery.findById(deliveryId);
  if (delivery && !delivery.otpVerified && delivery.status === 'scheduled') {
    delivery.status = 'failed';
    delivery.statusHistory.push({ status: 'failed', at: new Date() });
    await delivery.save();
  }
});

module.exports = true;
