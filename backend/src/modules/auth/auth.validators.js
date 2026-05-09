const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Password must contain at least one lowercase letter, one uppercase letter, and one number" }),
    role: z.enum(['customer', 'provider']),
    phone: z.string().optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "Password must contain at least one lowercase letter, one uppercase letter, and one number" })
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};
