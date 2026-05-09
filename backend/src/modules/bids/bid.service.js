const Bid = require('../../models/Bid');
const Ticket = require('../../models/Ticket');
const Provider = require('../../models/Provider');
const ApiError = require('../../utils/ApiError');
const NotificationService = require('../../services/NotificationService');
const { getIo } = require('../../config/socket');

class BidService {
  async submitBid(ticketId, providerId, bidData) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    if (!ticket.isBiddingOpen || !['open', 'bids_received'].includes(ticket.status)) {
      throw new ApiError(400, 'Bidding is closed for this ticket');
    }

    const provider = await Provider.findOne({ userId: providerId });
    if (!provider || provider.approvalStatus !== 'approved') {
      throw new ApiError(403, 'Only approved providers can submit bids');
    }

    const existingBid = await Bid.findOne({ ticketId, providerId });
    if (existingBid) {
      throw new ApiError(400, 'You have already submitted a bid for this ticket');
    }

    const bid = await Bid.create({
      ...bidData,
      ticketId,
      providerId,
      expiresAt: ticket.biddingExpiresAt
    });

    if (ticket.status === 'open') {
      ticket.status = 'bids_received';
      ticket.statusHistory.push({ status: 'bids_received', changedBy: providerId, changedAt: new Date() });
      await ticket.save();
    }

    await NotificationService.notifyBidReceived(ticket, bid, provider);

    try {
      getIo().to(`ticket:${ticketId}`).emit('bid:new', { ticketId, bid });
      getIo().to(`ticket:${ticketId}`).emit('ticket:status-updated', { ticketId, status: ticket.status, updatedAt: new Date() });
    } catch(err) { console.error(err); }

    return bid;
  }

  async getTicketBids(ticketId) {
    return Bid.find({ ticketId }).populate('providerId', 'name'); // We may want to populate the provider's details from User or Provider schema
  }

  async getMyBids(providerId) {
    return Bid.find({ providerId }).populate('ticketId', 'issueTitle status deviceType deviceBrand deviceModel');
  }

  async acceptBid(bidId, customerId) {
    const bid = await Bid.findById(bidId).populate('ticketId');
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    const ticket = bid.ticketId;
    if (ticket.customerId.toString() !== customerId.toString()) {
      throw new ApiError(403, 'You do not own this ticket');
    }

    if (bid.status !== 'pending') {
      throw new ApiError(400, `Cannot accept a bid that is ${bid.status}`);
    }

    if (!ticket.isBiddingOpen) {
      throw new ApiError(400, 'Bidding is closed for this ticket');
    }

    // Update bid to accepted
    bid.status = 'accepted';
    await bid.save();

    // Update ticket
    ticket.assignedProviderId = bid.providerId;
    ticket.acceptedBidId = bid._id;
    ticket.status = 'assigned';
    ticket.isBiddingOpen = false;
    ticket.statusHistory.push({ status: 'assigned', changedBy: customerId, changedAt: new Date() });
    await ticket.save();

    // Bulk update other bids to declined
    const otherBids = await Bid.find({ ticketId: ticket._id, _id: { $ne: bid._id }, status: 'pending' });
    await Bid.updateMany(
      { ticketId: ticket._id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'declined' }
    );

    // Notifications
    const providerUser = await Provider.findById(bid.providerId).select('userId');
    if (providerUser) {
      await NotificationService.notifyBidAccepted(ticket, providerUser.userId);
    }
    
    for (const otherBid of otherBids) {
      const otherProviderUser = await Provider.findById(otherBid.providerId).select('userId');
      if (otherProviderUser) {
        await NotificationService.notifyBidDeclined(ticket, otherProviderUser.userId);
      }
    }

    try {
      getIo().to(`ticket:${ticket._id}`).emit('bid:accepted', { ticketId: ticket._id, bidId: bid._id });
      getIo().to(`ticket:${ticket._id}`).emit('ticket:status-updated', { ticketId: ticket._id, status: ticket.status, updatedAt: new Date() });
    } catch(err) { console.error(err); }

    return bid;
  }

  async rejectBid(bidId, customerId) {
    const bid = await Bid.findById(bidId).populate('ticketId');
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    const ticket = bid.ticketId;
    if (ticket.customerId.toString() !== customerId.toString()) {
      throw new ApiError(403, 'You do not own this ticket');
    }

    if (bid.status !== 'pending') {
      throw new ApiError(400, `Cannot reject a bid that is ${bid.status}`);
    }

    bid.status = 'declined';
    await bid.save();

    return bid;
  }

  async withdrawBid(bidId, providerId) {
    const bid = await Bid.findOne({ _id: bidId, providerId });
    if (!bid) {
      throw new ApiError(404, 'Bid not found');
    }

    if (bid.status !== 'pending') {
      throw new ApiError(400, `Cannot withdraw a bid that is ${bid.status}`);
    }

    bid.status = 'withdrawn';
    await bid.save();

    // Check if it was the only active bid, and if so, revert ticket to 'open' if it was 'bids_received'
    const otherBidsCount = await Bid.countDocuments({ ticketId: bid.ticketId, status: 'pending' });
    if (otherBidsCount === 0) {
      const ticket = await Ticket.findById(bid.ticketId);
      if (ticket && ticket.status === 'bids_received') {
        ticket.status = 'open';
        ticket.statusHistory.push({ status: 'open', changedBy: providerId, changedAt: new Date() });
        await ticket.save();
      }
    }

    return bid;
  }
}

module.exports = new BidService();
