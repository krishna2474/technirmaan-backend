import z from "zod";

export const UserType = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  cls: z.string(),
  department: z.string(),
  college: z.string(),
  event: z.string(),
});
export const otpType = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(4),
});
