const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const bidController = require('./bid.controller');
const { submitBidSchema } = require('./bid.validators');

const router = express.Router();

router.use(authenticate);

// Ticket bids
router.post('/tickets/:ticketId/bids', authorize('provider'), validate(submitBidSchema), bidController.submitBid);
router.get('/tickets/:ticketId/bids', authorize('customer'), bidController.getTicketBids);

// Provider's own bids
router.get('/providers/me/bids', authorize('provider'), bidController.getMyBids);

// Bid actions
router.patch('/bids/:bidId/accept', authorize('customer'), bidController.acceptBid);
router.patch('/bids/:bidId/reject', authorize('customer'), bidController.rejectBid);
router.patch('/bids/:bidId/withdraw', authorize('provider'), bidController.withdrawBid);

module.exports = router;
