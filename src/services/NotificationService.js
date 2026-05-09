const Notification = require('../models/Notification');
const { getIo } = require('../config/socket');
const EmailService = require('./EmailService');

class NotificationService {
  async createNotification(userId, payload) {
    const { type, title, message, link, metadata } = payload;
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata
    });

    try {
      const io = getIo();
      io.to(`user:${userId}`).emit('notification:new', { notification });
    } catch (err) {
      console.error('Socket.io error emitting notification:', err);
    }

    return notification;
  }

  async notifyCustomer(customerId, payload) {
    return this.createNotification(customerId, payload);
  }

  async notifyProvider(providerUserId, payload) {
    return this.createNotification(providerUserId, payload);
  }

  async notifyBidReceived(ticket, bid, provider) {
    await this.notifyCustomer(ticket.customerId, {
      type: 'bid',
      title: 'New Bid Received',
      message: `You received a new bid of $${bid.quotedPrice} from ${provider.shopName}.`,
      link: `/tickets/${ticket._id}`,
      metadata: { ticketId: ticket._id, bidId: bid._id }
    });
  }

  async notifyBidAccepted(ticket, providerUserId) {
    await this.notifyProvider(providerUserId, {
      type: 'status',
      title: 'Bid Accepted!',
      message: `Your bid for ticket ${ticket.ticketNo} has been accepted.`,
      link: `/provider/jobs/${ticket._id}`,
      metadata: { ticketId: ticket._id }
    });
  }

  async notifyBidDeclined(ticket, providerUserId) {
    await this.notifyProvider(providerUserId, {
      type: 'status',
      title: 'Bid Declined',
      message: `Your bid for ticket ${ticket.ticketNo} was not selected.`,
      link: `/provider/marketplace`,
      metadata: { ticketId: ticket._id }
    });
  }

  async notifyStatusChange(ticket, newStatus) {
    const title = 'Ticket Status Updated';
    const message = `Ticket ${ticket.ticketNo} status is now ${newStatus}.`;
    
    // Notify customer
    await this.notifyCustomer(ticket.customerId, {
      type: 'status',
      title,
      message,
      link: `/tickets/${ticket._id}`,
      metadata: { ticketId: ticket._id }
    });
  }

  async notifyDeliveryUpdate(ticket, delivery) {
    const message = `Delivery update for ticket ${ticket.ticketNo}: ${delivery.status}`;
    await this.notifyCustomer(ticket.customerId, {
      type: 'delivery',
      title: 'Delivery Update',
      message,
      link: `/tickets/${ticket._id}/delivery`,
      metadata: { ticketId: ticket._id, deliveryId: delivery._id }
    });
    
    if (ticket.assignedProviderId) {
      // Find the user ID of the provider
      const mongoose = require('mongoose');
      const Provider = mongoose.model('Provider');
      const provider = await Provider.findById(ticket.assignedProviderId);
      if (provider) {
        await this.notifyProvider(provider.userId, {
          type: 'delivery',
          title: 'Delivery Update',
          message,
          link: `/provider/delivery/${ticket._id}`,
          metadata: { ticketId: ticket._id, deliveryId: delivery._id }
        });
      }
    }
  }

  async notifyOtp(userId, otp, leg, user) {
    await this.createNotification(userId, {
      type: 'delivery',
      title: 'Delivery OTP',
      message: `Your OTP for ${leg} delivery is ${otp}. Do not share this.`,
    });
    
    // Optional: Also email
    if (user && user.email) {
      await EmailService.sendOtpEmail(user, otp, leg);
    }
  }
}

module.exports = new NotificationService();
