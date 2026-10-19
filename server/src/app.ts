import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./routes/auth";
import { entriesRouter } from "./routes/entries";
import { goalRouter } from "./routes/goal";
import { statsRouter } from "./routes/stats";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/api/me", requireAuth, (req, res) => {
  res.status(200).json({ userId: req.userId });
});

app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/goal", goalRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);