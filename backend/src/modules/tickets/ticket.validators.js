const { z } = require("zod");

const createTicketSchema = z.object({
  body: z.object({
    deviceType: z.string({ required_error: "Device type is required" }),
    deviceBrand: z.string({ required_error: "Device brand is required" }),
    deviceModel: z.string({ required_error: "Device model is required" }),
    issueTitle: z.string({ required_error: "Issue title is required" }),
    issueDescription: z.string({
      required_error: "Issue description is required",
    }),
    photos: z.array(z.string()).optional(),
    urgency: z.enum(["low", "medium", "high"]).optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    pickupAddress: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    preferredHandover: z.enum(["pickup_delivery", "drop_off"]).optional(),
  }),
});

const updateRepairStatusSchema = z.object({
  body: z.object({
    status: z.enum(
      [
        "pickup_scheduled",
        "device_in_transit",
        "device_received",
        "in_repair",
        "repair_complete",
        "return_in_transit",
        "delivered",
        "closed",
      ],
      { required_error: "Valid status is required" },
    ),
  }),
});

const addRepairLogSchema = z.object({
  body: z.object({
    type: z.enum(
      ["update", "part_ordered", "part_received", "delay", "other"],
      { required_error: "Log type is required" },
    ),
    note: z.string({ required_error: "Note is required" }),
    visibility: z.enum(["internal", "customer"]).optional(),
    photos: z.array(z.string()).optional(),
  }),
});

module.exports = {
  createTicketSchema,
  updateRepairStatusSchema,
  addRepairLogSchema,
};
