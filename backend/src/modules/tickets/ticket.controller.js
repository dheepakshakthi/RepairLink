const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const ticketService = require("./ticket.service");

exports.createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.user._id, req.body);
  res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});

exports.getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getMyTickets(req.user._id, req.user.role);
  res
    .status(200)
    .json(new ApiResponse(200, tickets, "Tickets retrieved successfully"));
});

exports.getMarketplace = asyncHandler(async (req, res) => {
  const result = await ticketService.getMarketplace(req.user._id, req.query);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Marketplace tickets retrieved successfully",
      ),
    );
});

exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicket(req.params.id, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket retrieved successfully"));
});

exports.cancelTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.cancelTicket(req.params.id, req.user._id);
  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket cancelled successfully"));
});

exports.updateRepairStatus = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateRepairStatus(
    req.params.id,
    req.user._id,
    req.body.status,
  );
  res
    .status(200)
    .json(new ApiResponse(200, ticket, "Repair status updated successfully"));
});

exports.addRepairLog = asyncHandler(async (req, res) => {
  const ticket = await ticketService.addRepairLog(
    req.params.id,
    req.user._id,
    req.body,
  );
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        ticket.repairLog[ticket.repairLog.length - 1],
        "Repair log added successfully",
      ),
    );
});

exports.getRepairLog = asyncHandler(async (req, res) => {
  const logs = await ticketService.getRepairLog(req.params.id, req.user);
  res
    .status(200)
    .json(new ApiResponse(200, logs, "Repair logs retrieved successfully"));
});

exports.uploadTicketPhotos = asyncHandler(async (req, res) => {
  const photoUrls = await ticketService.uploadTicketPhotos(req.files);
  res
    .status(200)
    .json(new ApiResponse(200, { photoUrls }, "Photos uploaded successfully"));
});
