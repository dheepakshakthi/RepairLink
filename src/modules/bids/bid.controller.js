const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const bidService = require('./bid.service');

exports.submitBid = asyncHandler(async (req, res) => {
  const bid = await bidService.submitBid(req.params.ticketId, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, bid, 'Bid submitted successfully'));
});

exports.getTicketBids = asyncHandler(async (req, res) => {
  const bids = await bidService.getTicketBids(req.params.ticketId);
  res.status(200).json(new ApiResponse(200, bids, 'Ticket bids retrieved successfully'));
});

exports.getMyBids = asyncHandler(async (req, res) => {
  const bids = await bidService.getMyBids(req.user._id);
  res.status(200).json(new ApiResponse(200, bids, 'Your bids retrieved successfully'));
});

exports.acceptBid = asyncHandler(async (req, res) => {
  const bid = await bidService.acceptBid(req.params.bidId, req.user._id);
  res.status(200).json(new ApiResponse(200, bid, 'Bid accepted successfully'));
});

exports.rejectBid = asyncHandler(async (req, res) => {
  const bid = await bidService.rejectBid(req.params.bidId, req.user._id);
  res.status(200).json(new ApiResponse(200, bid, 'Bid rejected successfully'));
});

exports.withdrawBid = asyncHandler(async (req, res) => {
  const bid = await bidService.withdrawBid(req.params.bidId, req.user._id);
  res.status(200).json(new ApiResponse(200, bid, 'Bid withdrawn successfully'));
});
