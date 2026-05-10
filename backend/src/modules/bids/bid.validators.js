const { z } = require("zod");

const submitBidSchema = z.object({
  body: z.object({
    quotedPrice: z
      .number({ required_error: "Quoted price is required" })
      .min(1, "Price must be greater than 0"),
    estimatedDays: z
      .number({ required_error: "Estimated days is required" })
      .min(1, "Estimated days must be at least 1"),
    notes: z.string().optional(),
    validUntil: z.string().datetime().optional(),
  }),
});

module.exports = {
  submitBidSchema,
};
