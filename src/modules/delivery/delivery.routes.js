const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const deliveryController = require('./delivery.controller');

const router = express.Router();

router.use(authenticate);

// Delivery specific routes
router.post('/:deliveryId/confirm-otp', authorize('customer', 'provider'), deliveryController.confirmOtp);
router.post('/:deliveryId/advance', authorize('admin'), deliveryController.advanceDeliveryStatus);

module.exports = router;
