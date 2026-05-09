const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const reviewService = require('./review.service');

exports.submitReview = asyncHandler(async (req, res) => {
  const review = await reviewService.submitReview(req.params.ticketId, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

exports.getProviderReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProviderReviews(req.params.providerId, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Reviews retrieved'));
});

exports.replyToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.replyToReview(req.params.reviewId, req.user._id, req.body.reply);
  res.status(200).json(new ApiResponse(200, review, 'Reply added'));
});

exports.flagReview = asyncHandler(async (req, res) => {
  const review = await reviewService.flagReview(req.params.reviewId, req.user._id, req.body.reason);
  res.status(200).json(new ApiResponse(200, review, 'Review flagged'));
});
