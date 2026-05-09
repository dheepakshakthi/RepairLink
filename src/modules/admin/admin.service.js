const User = require('../../models/User');
const Provider = require('../../models/Provider');
const Ticket = require('../../models/Ticket');
const Review = require('../../models/Review');
const AuditLog = require('../../models/AuditLog');
const Setting = require('../../models/Setting');
const EmailService = require('../../services/EmailService');
const ApiError = require('../../utils/ApiError');
const NotificationService = require('../../services/NotificationService');

class AdminService {
  async createAuditLog(req, action, targetId, targetModel, before, after) {
    await AuditLog.create({
      adminId: req.user._id,
      action,
      targetId,
      targetModel,
      before,
      after,
      ip: req.ip
    });
  }

  // Users
  async getUsers(query) {
    const { role, status, search, page = 1, limit = 20 } = query;
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'suspended') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter).skip(skip).limit(Number(limit));
    const total = await User.countDocuments(filter);
    return { users, total, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page) };
  }

  async getUser(id) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    const tickets = await Ticket.find({ customerId: id });
    return { user, tickets };
  }

  async toggleUserStatus(id, req) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    const before = user.toObject();
    user.isActive = !user.isActive;
    await user.save();
    await this.createAuditLog(req, 'user.status_toggle', user._id, 'User', before, user.toObject());
    return user;
  }

  async banUser(id, req) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    const before = user.toObject();
    user.isActive = false;
    user.refreshTokens = [];
    await user.save();
    await this.createAuditLog(req, 'user.ban', user._id, 'User', before, user.toObject());
    // TODO: send ban email
    return user;
  }

  // Providers
  async getProviders(query) {
    const { approvalStatus, page = 1, limit = 20 } = query;
    const filter = {};
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    const skip = (Number(page) - 1) * Number(limit);
    const providers = await Provider.find(filter).populate('userId', 'name email avatar').skip(skip).limit(Number(limit));
    const total = await Provider.countDocuments(filter);
    return { providers, total, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page) };
  }

  async getProvider(id) {
    const provider = await Provider.findById(id).populate('userId');
    if (!provider) throw new ApiError(404, 'Provider not found');
    return provider;
  }

  async approveProvider(id, req) {
    const provider = await Provider.findById(id).populate('userId');
    if (!provider) throw new ApiError(404, 'Provider not found');
    const before = provider.toObject();
    provider.approvalStatus = 'approved';
    await provider.save();
    await this.createAuditLog(req, 'provider.approve', provider._id, 'Provider', before, provider.toObject());
    
    // Unlock user account
    const user = await User.findById(provider.userId._id);
    user.isActive = true;
    await user.save();
    
    // TODO: Send approval email
    return provider;
  }

  async rejectProvider(id, reason, req) {
    const provider = await Provider.findById(id);
    if (!provider) throw new ApiError(404, 'Provider not found');
    const before = provider.toObject();
    provider.approvalStatus = 'rejected';
    provider.approvalNote = reason;
    await provider.save();
    await this.createAuditLog(req, 'provider.reject', provider._id, 'Provider', before, provider.toObject());
    // TODO: Send rejection email
    return provider;
  }

  async suspendProvider(id, req) {
    const provider = await Provider.findById(id);
    if (!provider) throw new ApiError(404, 'Provider not found');
    const before = provider.toObject();
    provider.approvalStatus = 'suspended';
    await provider.save();
    await this.createAuditLog(req, 'provider.suspend', provider._id, 'Provider', before, provider.toObject());
    return provider;
  }

  // Tickets
  async getTickets(query) {
    const { status, deviceType, customerId, providerId, page = 1, limit = 20 } = query;
    const filter = {};
    if (status) filter.status = status;
    if (deviceType) filter.deviceType = deviceType;
    if (customerId) filter.customerId = customerId;
    if (providerId) filter.assignedProviderId = providerId;
    
    const skip = (Number(page) - 1) * Number(limit);
    const tickets = await Ticket.find(filter).skip(skip).limit(Number(limit))
      .populate('customerId', 'name')
      .populate('assignedProviderId', 'shopName');
    const total = await Ticket.countDocuments(filter);
    return { tickets, total, totalPages: Math.ceil(total / Number(limit)), currentPage: Number(page) };
  }

  async getTicket(id) {
    const ticket = await Ticket.findById(id)
      .populate('customerId', 'name email')
      .populate('assignedProviderId', 'shopName rating')
      .populate('acceptedBidId');
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    return ticket;
  }

  async overrideTicketStatus(id, newStatus, req) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    const before = ticket.toObject();
    ticket.status = newStatus;
    ticket.statusHistory.push({ status: newStatus, changedBy: req.user._id, changedAt: new Date(), note: 'Admin override' });
    await ticket.save();
    await this.createAuditLog(req, 'ticket.override_status', ticket._id, 'Ticket', before, ticket.toObject());
    return ticket;
  }

  async reassignTicket(id, providerId, req) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    const before = ticket.toObject();
    ticket.assignedProviderId = providerId;
    await ticket.save();
    await this.createAuditLog(req, 'ticket.reassign', ticket._id, 'Ticket', before, ticket.toObject());
    return ticket;
  }

  // Disputes
  async getDisputes() {
    const disputedTickets = await Ticket.find({ status: 'disputed' });
    const flaggedReviews = await Review.find({ isFlagged: true });
    return { disputedTickets, flaggedReviews };
  }

  async resolveDispute(ticketId, resolution, note, req) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    const before = ticket.toObject();
    
    // Simple state change
    ticket.status = 'closed';
    ticket.statusHistory.push({ status: 'closed', changedBy: req.user._id, changedAt: new Date(), note: `Admin resolved: ${resolution}` });
    await ticket.save();
    await this.createAuditLog(req, 'ticket.resolve_dispute', ticket._id, 'Ticket', before, ticket.toObject());
    
    await NotificationService.notifyCustomer(ticket.customerId, {
      type: 'system', title: 'Dispute Resolved', message: `Your dispute for ticket ${ticket.ticketNo} has been resolved.`, link: `/tickets/${ticket._id}`
    });

    if (ticket.assignedProviderId) {
      const provider = await Provider.findById(ticket.assignedProviderId);
      if (provider) {
        await NotificationService.notifyProvider(provider.userId, {
          type: 'system', title: 'Dispute Resolved', message: `The dispute for ticket ${ticket.ticketNo} has been resolved.`, link: `/provider/jobs/${ticket._id}`
        });
      }
    }
    return ticket;
  }

  // Analytics
  async getAnalytics() {
    const [
      customers, providers, admins,
      totalTickets, ticketsByStatus,
      revenueStats
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'admin' }),
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $match: { status: 'closed', finalPrice: { $exists: true } } }, { $group: { _id: null, total: { $sum: '$finalPrice' } } }])
    ]);

    return {
      users: { customers, providers, admins },
      tickets: { total: totalTickets, byStatus: ticketsByStatus },
      revenue: revenueStats[0] ? revenueStats[0].total : 0
    };
  }

  // Settings
  async getSettings() {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    return setting;
  }

  async updateSettings(data, req) {
    let setting = await Setting.findOne();
    if (!setting) setting = await Setting.create({});
    const before = setting.toObject();
    Object.assign(setting, data);
    await setting.save();
    await this.createAuditLog(req, 'settings.update', setting._id, 'Setting', before, setting.toObject());
    return setting;
  }
}

module.exports = new AdminService();
