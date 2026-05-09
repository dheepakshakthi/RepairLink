const Message = require('../../models/Message');
const Ticket = require('../../models/Ticket');
const ApiError = require('../../utils/ApiError');
const { getIo } = require('../../config/socket');
const NotificationService = require('../../services/NotificationService');

class ChatService {
  async getMessages(ticketId, user, queryParams) {
    const { page = 1, limit = 50 } = queryParams;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    // Access control
    if (user.role === 'customer' && ticket.customerId.toString() !== user._id.toString()) {
      throw new ApiError(403, 'Access denied');
    }
    if (user.role === 'provider' && (!ticket.assignedProviderId || ticket.assignedProviderId.toString() !== user.providerId?.toString())) {
      // Check if user is the assigned provider. In auth, providerId is not natively on user, we need to check provider model.
      // Assuming caller resolves user's provider document id or we do it here.
      const mongoose = require('mongoose');
      const Provider = mongoose.model('Provider');
      const provider = await Provider.findOne({ userId: user._id });
      if (!provider || !ticket.assignedProviderId || ticket.assignedProviderId.toString() !== provider._id.toString()) {
        throw new ApiError(403, 'Access denied');
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({ ticketId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('senderId', 'name avatar');

    // Mark as read for the user requesting
    await Message.updateMany(
      { ticketId, senderId: { $ne: user._id }, isRead: false },
      { isRead: true }
    );

    return messages.reverse(); // Return in chronological order
  }

  async sendMessage(ticketId, user, data) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');

    const isCustomer = user.role === 'customer' && ticket.customerId.toString() === user._id.toString();
    
    let isProvider = false;
    let providerUserId = null;
    if (user.role === 'provider') {
      const mongoose = require('mongoose');
      const Provider = mongoose.model('Provider');
      const provider = await Provider.findOne({ userId: user._id });
      if (provider && ticket.assignedProviderId && ticket.assignedProviderId.toString() === provider._id.toString()) {
        isProvider = true;
      }
    }

    if (!isCustomer && !isProvider) {
      throw new ApiError(403, 'You are not a participant in this ticket');
    }

    const message = await Message.create({
      ticketId,
      senderId: user._id,
      senderRole: user.role,
      content: data.content,
      attachments: data.attachments || []
    });

    try {
      getIo().to(`ticket:${ticketId}`).emit('chat:message', { message });
    } catch(err) { console.error(err); }

    // Notify other party
    const recipientId = isCustomer 
      ? (await require('mongoose').model('Provider').findById(ticket.assignedProviderId)).userId 
      : ticket.customerId;

    await NotificationService.createNotification(recipientId, {
      type: 'chat',
      title: 'New Message',
      message: `You have a new message regarding ticket ${ticket.ticketNo}`,
      link: user.role === 'customer' ? `/provider/jobs/${ticketId}` : `/tickets/${ticketId}`
    });

    return message;
  }

  async uploadAttachment(files) {
    if (!files || files.length === 0) throw new ApiError(400, 'No files uploaded');
    return files.map(f => f.path);
  }
}

module.exports = new ChatService();
