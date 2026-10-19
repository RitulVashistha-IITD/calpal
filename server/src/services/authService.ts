import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.ts";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { RegisterInput, LoginInput } from "../schemas/auth";

const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (u: { id: string; name: string; email: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
});

export async function register(input: RegisterInput) {
  if (await User.exists({ email: input.email.toLowerCase() })) {
    throw new AppError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });
  return { token: signToken(user.id), user: publicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+passwordHash");
  const ok = user && (await bcrypt.compare(input.password, user.passwordHash));
  if (!user || !ok) throw new AppError(401, "Invalid email or password");
  return { token: signToken(user.id), user: publicUser(user) };
}