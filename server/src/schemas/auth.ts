import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72), // bcrypt ignores anything past 72 bytes
});
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;