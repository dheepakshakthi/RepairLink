const Review = require('../../models/Review');
const Ticket = require('../../models/Ticket');
const Provider = require('../../models/Provider');
const ApiError = require('../../utils/ApiError');
const NotificationService = require('../../services/NotificationService');

class ReviewService {
  async submitReview(ticketId, customerId, data) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    if (ticket.customerId.toString() !== customerId.toString()) throw new ApiError(403, 'Not your ticket');
    
    if (!['delivered', 'closed'].includes(ticket.status)) {
      throw new ApiError(400, 'Ticket must be delivered or closed to leave a review');
    }

    const existing = await Review.findOne({ ticketId });
    if (existing) throw new ApiError(400, 'Review already exists for this ticket');

    const review = await Review.create({
      ticketId,
      customerId,
      providerId: ticket.assignedProviderId,
      ratingQuality: data.ratingQuality,
      ratingSpeed: data.ratingSpeed,
      ratingCommunication: data.ratingCommunication,
      comment: data.comment,
      photos: data.photos || []
    });

    // Update Provider rating and review count
    const allReviews = await Review.find({ providerId: ticket.assignedProviderId });
    const avgRating = allReviews.reduce((acc, r) => acc + r.overallRating, 0) / allReviews.length;
    
    await Provider.findByIdAndUpdate(ticket.assignedProviderId, {
      $set: { rating: avgRating, totalReviews: allReviews.length }
    });

    const provider = await Provider.findById(ticket.assignedProviderId);
    await NotificationService.createNotification(provider.userId, {
      type: 'review',
      title: 'New Review',
      message: `You received a ${review.overallRating.toFixed(1)}-star review for ticket ${ticket.ticketNo}`,
      link: `/provider/profile`
    });

    return review;
  }

  async getProviderReviews(providerId, query) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ providerId });

    return {
      reviews,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    };
  }

  async replyToReview(reviewId, providerUserId, reply) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    const provider = await Provider.findById(review.providerId);
    if (!provider || provider.userId.toString() !== providerUserId.toString()) {
      throw new ApiError(403, 'Not your review to reply to');
    }

    review.providerReply = reply;
    review.providerRepliedAt = new Date();
    await review.save();

    const ticket = await Ticket.findById(review.ticketId);
    await NotificationService.createNotification(review.customerId, {
      type: 'review',
      title: 'Provider Replied',
      message: `${provider.shopName} replied to your review on ticket ${ticket.ticketNo}`,
      link: `/tickets/${ticket._id}`
    });

    return review;
  }

  async flagReview(reviewId, customerId, reason) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    if (review.customerId.toString() !== customerId.toString()) {
      throw new ApiError(403, 'Not your review');
    }

    review.isFlagged = true;
    review.flagReason = reason;
    await review.save();

    return review;
  }
}

module.exports = new ReviewService();
