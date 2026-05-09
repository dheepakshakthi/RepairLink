const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const adminController = require('./admin.controller');

const router = express.Router();

router.use(authenticate, authorize('admin'));

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/ban', adminController.banUser);

// Providers
router.get('/providers', adminController.getProviders);
router.get('/providers/:id', adminController.getProvider);
router.patch('/providers/:id/approve', adminController.approveProvider);
router.patch('/providers/:id/reject', adminController.rejectProvider);
router.patch('/providers/:id/suspend', adminController.suspendProvider);

// Tickets
router.get('/tickets', adminController.getTickets);
router.get('/tickets/:id', adminController.getTicket);
router.patch('/tickets/:id/status', adminController.overrideTicketStatus);
router.patch('/tickets/:id/reassign', adminController.reassignTicket);

// Disputes
router.get('/disputes', adminController.getDisputes);
router.patch('/disputes/:ticketId/resolve', adminController.resolveDispute);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
