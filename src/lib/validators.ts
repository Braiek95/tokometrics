import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createShopSchema = z.object({
  name: z.string().min(1, "Shop name is required").max(100),
  region: z.string().default("US"),
  currency: z.string().default("USD"),
});

export const updateShopSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
  status: z.enum(["ACTIVE", "DISCONNECTED", "PENDING", "ERROR"]).optional(),
});

export const shopSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  syncIntervalMinutes: z.number().min(5).max(1440).optional(),
  monthlyRevenueGoal: z.number().min(0).optional(),
  annualRevenueGoal: z.number().min(0).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
