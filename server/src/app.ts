import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth";
import { entriesRouter } from "./routes/entries";
import { goalRouter } from "./routes/goal";
import { statsRouter } from "./routes/stats";
import { foodsRouter, optimizerRouter } from "./routes/foods";
import { caloriesRouter } from "./routes/calories";
import { requireAuth } from "./middleware/auth";
import { errorHandler, AppError } from "./middleware/errorHandler";
import { authLimiter, apiLimiter } from "./middleware/rateLimit";
import { profileRouter } from "./routes/profile";

export const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.use("/api", apiLimiter); // must come BEFORE the routes it protects

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/me", requireAuth, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/goal", goalRouter);
app.use("/api/stats", statsRouter);
app.use("/api/foods", foodsRouter);
app.use("/api/optimizer", optimizerRouter);
app.use("/api/calories", caloriesRouter);
app.use("/api/profile", profileRouter);

// Anything that matched no route above becomes a JSON 404
app.use((_req, _res, next) => next(new AppError(404, "Route not found")));

app.use(errorHandler); // always last