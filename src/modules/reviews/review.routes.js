const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const reviewController = require('./review.controller');

const router = express.Router();

// Public route
router.get('/providers/:providerId/reviews', reviewController.getProviderReviews);

router.use(authenticate);

router.post('/tickets/:ticketId/review', authorize('customer'), reviewController.submitReview);
router.post('/reviews/:reviewId/reply', authorize('provider'), reviewController.replyToReview);
router.post('/reviews/:reviewId/flag', authorize('customer', 'admin'), reviewController.flagReview);

module.exports = router;
