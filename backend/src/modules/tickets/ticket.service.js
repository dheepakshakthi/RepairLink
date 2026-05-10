const Ticket = require("../../models/Ticket");
const Bid = require("../../models/Bid");
const ApiError = require("../../utils/ApiError");
const generateTicketNo = require("../../utils/generateTicketNo");
const NotificationService = require("../../services/NotificationService");
const { getIo } = require("../../config/socket");
const { biddingExpireQueue } = require("../../jobs/index");
const Delivery = require("../../models/Delivery");
const bcrypt = require("bcryptjs");

class TicketService {
  async createTicket(customerId, ticketData) {
    const ticketNo = await generateTicketNo(ticketData.deviceType);
    const biddingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const ticket = await Ticket.create({
      ...ticketData,
      ticketNo,
      customerId,
      biddingExpiresAt,
      statusHistory: [
        { status: "open", changedBy: customerId, changedAt: new Date() },
      ],
    });

    // Schedule Bull job for bidding expiration
    await biddingExpireQueue.add(
      { ticketId: ticket._id },
      { delay: 24 * 60 * 60 * 1000 },
    );

    await NotificationService.createNotification(customerId, {
      type: "system",
      title: "Ticket Created",
      message: `Your ticket ${ticket.ticketNo} has been created and is open for bids.`,
      link: `/tickets/${ticket._id}`,
    });

    return ticket;
  }

  async getMyTickets(userId, role) {
    const filter =
      role === "provider"
        ? { assignedProviderId: userId }
        : { customerId: userId };
    return Ticket.find(filter).sort({ createdAt: -1 });
  }

  async getMarketplace(providerId, queryParams) {
    const {
      deviceType,
      urgency,
      budgetMin,
      budgetMax,
      page = 1,
      limit = 10,
      sort = "createdAt_desc",
    } = queryParams;

    // Find tickets where provider has already bid to exclude them
    const providerBids = await Bid.find({ providerId }).select("ticketId");
    const biddedTicketIds = providerBids.map((bid) => bid.ticketId);

    const filter = {
      status: { $in: ["open", "bids_received"] },
      isBiddingOpen: true,
      _id: { $nin: biddedTicketIds },
    };

    if (deviceType) filter.deviceType = deviceType;
    if (urgency) filter.urgency = urgency;
    if (budgetMin) filter.budgetMax = { $gte: Number(budgetMin) }; // If user sets budgetMin, we show tickets where their budgetMax is at least this
    if (budgetMax) filter.budgetMin = { $lte: Number(budgetMax) };

    const sortOptions = {};
    if (sort === "budget_desc") {
      sortOptions.budgetMax = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(filter)
      .populate("customerId", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Ticket.countDocuments(filter);

    return {
      tickets,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    };
  }

  async getTicket(ticketId, user) {
    const ticket = await Ticket.findById(ticketId)
      .populate("customerId", "name email")
      .populate("assignedProviderId", "companyName")
      .populate("acceptedBidId");

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    // Access control
    if (
      user.role === "customer" &&
      ticket.customerId._id.toString() !== user._id.toString()
    ) {
      throw new ApiError(403, "Access denied");
    }

    if (user.role === "provider") {
      const isAssigned =
        ticket.assignedProviderId &&
        ticket.assignedProviderId._id.toString() === user._id.toString();
      const hasBid = await Bid.exists({ ticketId, providerId: user._id });

      if (!isAssigned && !hasBid) {
        throw new ApiError(
          403,
          "Access denied. You have not bid on or been assigned this ticket.",
        );
      }
    }

    return ticket;
  }

  async cancelTicket(ticketId, customerId) {
    const ticket = await Ticket.findOne({ _id: ticketId, customerId });
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    if (!["open", "bids_received"].includes(ticket.status)) {
      throw new ApiError(
        400,
        `Cannot cancel ticket with status ${ticket.status}`,
      );
    }

    ticket.status = "cancelled";
    ticket.isBiddingOpen = false;
    ticket.statusHistory.push({
      status: "cancelled",
      changedBy: customerId,
      changedAt: new Date(),
    });

    await ticket.save();

    // Reject all pending bids
    await Bid.updateMany(
      { ticketId, status: "pending" },
      { status: "declined" },
    );

    return ticket;
  }

  async updateRepairStatus(ticketId, providerId, newStatus) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    if (
      !ticket.assignedProviderId ||
      ticket.assignedProviderId.toString() !== providerId.toString()
    ) {
      throw new ApiError(403, "Not assigned to this ticket");
    }

    const validTransitions = {
      assigned: ["pickup_scheduled", "device_received"], // Allow jumping to received if dropoff
      pickup_scheduled: ["device_in_transit"],
      device_in_transit: ["device_received"],
      device_received: ["in_repair"],
      in_repair: ["repair_complete"],
      repair_complete: ["return_in_transit", "delivered"], // Delivered if pickup by customer
      return_in_transit: ["delivered"],
      delivered: ["closed"],
    };

    const allowedNextStatuses = validTransitions[ticket.status];

    if (!allowedNextStatuses || !allowedNextStatuses.includes(newStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition from ${ticket.status} to ${newStatus}`,
      );
    }

    ticket.status = newStatus;
    ticket.statusHistory.push({
      status: newStatus,
      changedBy: providerId,
      changedAt: new Date(),
    });

    await ticket.save();

    // Side effects
    if (newStatus === "repair_complete") {
      // Auto-create return delivery
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otp, 10);
      const delivery = await Delivery.create({
        ticketId,
        leg: "return",
        otpHash,
        otpExpiresAt: new Date(Date.now() + 30 * 60000),
        statusHistory: [{ status: "scheduled", at: new Date() }],
      });
      // Send OTP to customer
      await NotificationService.notifyOtp(ticket.customerId, otp, "return");
    }

    await NotificationService.notifyStatusChange(ticket, newStatus);

    try {
      getIo()
        .to(`ticket:${ticketId}`)
        .emit("ticket:status-updated", {
          ticketId,
          status: newStatus,
          updatedAt: new Date(),
        });
    } catch (err) {
      console.error(err);
    }

    return ticket;
  }

  async addRepairLog(ticketId, providerId, logData) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    if (
      !ticket.assignedProviderId ||
      ticket.assignedProviderId.toString() !== providerId.toString()
    ) {
      throw new ApiError(403, "Not assigned to this ticket");
    }

    if (!["device_received", "in_repair"].includes(ticket.status)) {
      throw new ApiError(
        400,
        "Repair log can only be added when device is received or in repair",
      );
    }

    const logEntry = {
      ...logData,
      createdBy: providerId,
      createdAt: new Date(),
    };

    ticket.repairLog.push(logEntry);
    await ticket.save();

    if (logData.visibility === "shared") {
      await NotificationService.createNotification(ticket.customerId, {
        type: "status",
        title: "Repair Log Updated",
        message: `A new repair log has been added to your ticket ${ticket.ticketNo}`,
        link: `/tickets/${ticket._id}`,
      });
    }

    try {
      getIo()
        .to(`ticket:${ticketId}`)
        .emit("ticket:repair-log-added", {
          ticketId,
          logEntry: ticket.repairLog[ticket.repairLog.length - 1],
        });
    } catch (err) {
      console.error(err);
    }

    return ticket;
  }

  async getRepairLog(ticketId, user) {
    const ticket = await this.getTicket(ticketId, user); // Leverage existing access control

    if (user.role === "customer") {
      return ticket.repairLog.filter((log) => log.visibility === "customer");
    }

    return ticket.repairLog;
  }

  async uploadTicketPhotos(files) {
    if (!files || files.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }
    return files.map((file) => file.path);
  }
}

module.exports = new TicketService();
