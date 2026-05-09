const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const deliveryService = require('./delivery.service');

exports.schedulePickup = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.schedulePickup(req.params.ticketId, req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, delivery, 'Pickup scheduled successfully'));
});

exports.getDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await deliveryService.getDeliveries(req.params.ticketId, req.user._id, req.user.role);
  res.status(200).json(new ApiResponse(200, deliveries, 'Deliveries retrieved successfully'));
});

exports.confirmOtp = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.confirmOtp(req.params.deliveryId, req.user._id, req.body.otp);
  res.status(200).json(new ApiResponse(200, delivery, 'OTP confirmed successfully'));
});

exports.advanceDeliveryStatus = asyncHandler(async (req, res) => {
  const delivery = await deliveryService.advanceDeliveryStatus(req.params.deliveryId, req.body.status);
  res.status(200).json(new ApiResponse(200, delivery, 'Delivery status advanced'));
});
