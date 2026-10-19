import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing token");
  }
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
};