const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");
const { uploadMultiple } = require("../../middleware/upload");
const ticketController = require("./ticket.controller");
const {
  createTicketSchema,
  updateRepairStatusSchema,
  addRepairLogSchema,
} = require("./ticket.validators");

// Note: To reuse bids routes within tickets like /tickets/:ticketId/bids,
// we will export a router and mount bid routes to it or mount them in index.js.
// We'll handle this in index.js by routing /tickets/:ticketId/bids to the bids module.

const router = express.Router();

router.use(authenticate);

// Provider specific routes
router.get(
  "/marketplace",
  authorize("provider"),
  ticketController.getMarketplace,
);

// Customer specific routes
router.post(
  "/",
  authorize("customer"),
  validate(createTicketSchema),
  ticketController.createTicket,
);
router.get("/", authorize("customer"), ticketController.getMyTickets); // Changed to / for getMyTickets
router.post(
  "/:id/photos",
  authorize("customer"),
  uploadMultiple("photos", 5),
  ticketController.uploadTicketPhotos,
);
router.patch(
  "/:id/cancel",
  authorize("customer"),
  ticketController.cancelTicket,
);

// Provider specific updates on tickets
router.patch(
  "/:id/status",
  authorize("provider"),
  validate(updateRepairStatusSchema),
  ticketController.updateRepairStatus,
);
router.post(
  "/:id/repair-log",
  authorize("provider"),
  validate(addRepairLogSchema),
  ticketController.addRepairLog,
);

// Delivery routes under tickets
const deliveryController = require('../delivery/delivery.controller');
router.post(
  '/:ticketId/delivery/schedule',
  authorize('customer'),
  deliveryController.schedulePickup
);
router.get(
  '/:ticketId/delivery',
  authorize('customer', 'provider'),
  deliveryController.getDeliveries
);

// Chat routes under tickets
const chatRoutes = require('../chat/chat.routes');
router.use('/:ticketId/messages', chatRoutes);

// Shared routes
router.get(
  "/:id",
  authorize("customer", "provider", "admin"),
  ticketController.getTicket,
);
router.get(
  "/:id/repair-log",
  authorize("customer", "provider"),
  ticketController.getRepairLog,
);

// Note: Ensure /me or /marketplace is above /:id otherwise it resolves as ID.
// Wait, getMyTickets is described as GET / in the prompt, but GET / has to handle customer getting their tickets and GET /marketplace is for providers.
// If GET / is getMyTickets, let's fix that.
// Let's redefine GET / to be getMyTickets for customers.

module.exports = router;
