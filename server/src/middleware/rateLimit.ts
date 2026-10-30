import { rateLimit } from "express-rate-limit";

const tooMany = { error: "Too many requests. Please try again in a few minutes." };

// Login/register: only FAILED attempts count, which is what slows down password guessing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
});

// General safety net for everything under /api
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
});