const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');
const adminService = require('./admin.service');

// Users
exports.getUsers = asyncHandler(async (req, res) => {
  const data = await adminService.getUsers(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Users retrieved'));
});
exports.getUser = asyncHandler(async (req, res) => {
  const data = await adminService.getUser(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'User retrieved'));
});
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const data = await adminService.toggleUserStatus(req.params.id, req);
  res.status(200).json(new ApiResponse(200, data, 'User status toggled'));
});
exports.banUser = asyncHandler(async (req, res) => {
  const data = await adminService.banUser(req.params.id, req);
  res.status(200).json(new ApiResponse(200, data, 'User banned'));
});

// Providers
exports.getProviders = asyncHandler(async (req, res) => {
  const data = await adminService.getProviders(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Providers retrieved'));
});
exports.getProvider = asyncHandler(async (req, res) => {
  const data = await adminService.getProvider(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Provider retrieved'));
});
exports.approveProvider = asyncHandler(async (req, res) => {
  const data = await adminService.approveProvider(req.params.id, req);
  res.status(200).json(new ApiResponse(200, data, 'Provider approved'));
});
exports.rejectProvider = asyncHandler(async (req, res) => {
  const data = await adminService.rejectProvider(req.params.id, req.body.reason, req);
  res.status(200).json(new ApiResponse(200, data, 'Provider rejected'));
});
exports.suspendProvider = asyncHandler(async (req, res) => {
  const data = await adminService.suspendProvider(req.params.id, req);
  res.status(200).json(new ApiResponse(200, data, 'Provider suspended'));
});

// Tickets
exports.getTickets = asyncHandler(async (req, res) => {
  const data = await adminService.getTickets(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Tickets retrieved'));
});
exports.getTicket = asyncHandler(async (req, res) => {
  const data = await adminService.getTicket(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Ticket retrieved'));
});
exports.overrideTicketStatus = asyncHandler(async (req, res) => {
  const data = await adminService.overrideTicketStatus(req.params.id, req.body.status, req);
  res.status(200).json(new ApiResponse(200, data, 'Ticket status overridden'));
});
exports.reassignTicket = asyncHandler(async (req, res) => {
  const data = await adminService.reassignTicket(req.params.id, req.body.providerId, req);
  res.status(200).json(new ApiResponse(200, data, 'Ticket reassigned'));
});

// Disputes
exports.getDisputes = asyncHandler(async (req, res) => {
  const data = await adminService.getDisputes();
  res.status(200).json(new ApiResponse(200, data, 'Disputes retrieved'));
});
exports.resolveDispute = asyncHandler(async (req, res) => {
  const data = await adminService.resolveDispute(req.params.ticketId, req.body.resolution, req.body.note, req);
  res.status(200).json(new ApiResponse(200, data, 'Dispute resolved'));
});

// Analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics();
  res.status(200).json(new ApiResponse(200, data, 'Analytics retrieved'));
});

// Settings
exports.getSettings = asyncHandler(async (req, res) => {
  const data = await adminService.getSettings();
  res.status(200).json(new ApiResponse(200, data, 'Settings retrieved'));
});
exports.updateSettings = asyncHandler(async (req, res) => {
  const data = await adminService.updateSettings(req.body, req);
  res.status(200).json(new ApiResponse(200, data, 'Settings updated'));
});
