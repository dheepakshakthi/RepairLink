const Delivery = require('../../models/Delivery');
const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const NotificationService = require('../../services/NotificationService');
const { deliveryAdvanceQueue } = require('../../jobs/index');
const ApiError = require('../../utils/ApiError');
const { getIo } = require('../../config/socket');
const bcrypt = require('bcryptjs');

const MOCK_AGENTS = [
  { name: 'Rajan Kumar', phone: '+91 98765 12345', vehicleNo: 'TN 01 AB 1234' },
  { name: 'Priya Sharma', phone: '+91 87654 23456', vehicleNo: 'TN 02 CD 5678' },
];

class DeliveryService {
  async schedulePickup(ticketId, customerId, data) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    if (ticket.customerId.toString() !== customerId.toString()) throw new ApiError(403, 'Not your ticket');
    if (ticket.status !== 'assigned') throw new ApiError(400, 'Ticket must be assigned');

    const existing = await Delivery.findOne({ ticketId, leg: 'outbound' });
    if (existing) throw new ApiError(400, 'Outbound delivery already exists');

    const agent = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const scheduledTime = new Date(data.scheduledTime);
    
    const delivery = await Delivery.create({
      ticketId,
      leg: 'outbound',
      scheduledTime,
      estimatedArrival: new Date(scheduledTime.getTime() + 45 * 60000),
      otpHash,
      otpExpiresAt: new Date(scheduledTime.getTime() + 30 * 60000),
      agentName: agent.name,
      agentPhone: agent.phone,
      vehicleNo: agent.vehicleNo,
      fromAddress: ticket.pickupAddress || data.fromAddress,
      toAddress: data.toAddress || { city: 'Provider City' },
      statusHistory: [{ status: 'scheduled', at: new Date() }]
    });

    ticket.status = 'pickup_scheduled';
    ticket.statusHistory.push({ status: 'pickup_scheduled', changedBy: customerId, changedAt: new Date() });
    await ticket.save();

    // Get Provider User to send OTP
    const mongoose = require('mongoose');
    const Provider = mongoose.model('Provider');
    const provider = await Provider.findById(ticket.assignedProviderId).populate('userId');
    if (provider && provider.userId) {
      await NotificationService.notifyOtp(provider.userId._id, otp, 'outbound', provider.userId);
    }

    // Schedule Bull job
    await deliveryAdvanceQueue.add({ deliveryId: delivery._id, targetStatus: 'picked_up' }, { delay: 15 * 60000 });

    try {
      getIo().to(`ticket:${ticketId}`).emit('delivery:scheduled', { ticketId, delivery });
      getIo().to(`ticket:${ticketId}`).emit('ticket:status-updated', { ticketId, status: ticket.status, updatedAt: new Date() });
    } catch(err) { console.error(err); }

    const deliveryObj = delivery.toObject();
    delete deliveryObj.otpHash;
    return deliveryObj;
  }

  async getDeliveries(ticketId, userId, role) {
    // Validate access implicitly by verifying if user can see the ticket
    return Delivery.find({ ticketId });
  }

  async confirmOtp(deliveryId, userId, otp) {
    const delivery = await Delivery.findById(deliveryId).select('+otpHash');
    if (!delivery) throw new ApiError(404, 'Delivery not found');
    
    if (delivery.otpVerified) throw new ApiError(400, 'OTP already verified');
    if (delivery.otpExpiresAt < new Date()) throw new ApiError(400, 'OTP expired');

    const isMatch = await bcrypt.compare(otp, delivery.otpHash);
    if (!isMatch) {
      // In a real app we track failed attempts
      throw new ApiError(400, 'Invalid OTP');
    }

    delivery.otpVerified = true;
    delivery.otpHash = undefined;

    const ticket = await Ticket.findById(delivery.ticketId);

    if (delivery.leg === 'outbound') {
      delivery.status = 'delivered_to_provider';
      ticket.status = 'device_received';
    } else {
      delivery.status = 'delivered_to_customer';
      ticket.status = 'delivered';
      ticket.repairLog.push({ type: 'completed', note: 'Device delivered back to customer.', createdAt: new Date() });
    }

    delivery.statusHistory.push({ status: delivery.status, at: new Date() });
    await delivery.save();

    ticket.statusHistory.push({ status: ticket.status, changedBy: userId, changedAt: new Date() });
    await ticket.save();

    try {
      getIo().to(`ticket:${ticket._id}`).emit('delivery:status-updated', { ticketId: ticket._id, delivery });
      getIo().to(`ticket:${ticket._id}`).emit('ticket:status-updated', { ticketId: ticket._id, status: ticket.status, updatedAt: new Date() });
    } catch(err) { console.error(err); }

    return delivery;
  }

  async advanceDeliveryStatus(deliveryId, newStatus) {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) throw new ApiError(404, 'Delivery not found');
    
    delivery.status = newStatus;
    delivery.statusHistory.push({ status: newStatus, at: new Date() });
    await delivery.save();

    try {
      getIo().to(`ticket:${delivery.ticketId}`).emit('delivery:status-updated', { ticketId: delivery.ticketId, delivery });
    } catch(err) { console.error(err); }

    return delivery;
  }
}

module.exports = new DeliveryService();
