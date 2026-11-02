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
import { accountRouter } from "./routes/account";
import path from "node:path";
import fs from "node:fs";

export const app = express();
app.set("trust proxy", 1); // behind Render's proxy: without this, every visitor looks like one IP to the rate limiter

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
app.use("/api/account", authLimiter, accountRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/goal", goalRouter);
app.use("/api/stats", statsRouter);
app.use("/api/foods", foodsRouter);
app.use("/api/optimizer", optimizerRouter);
app.use("/api/calories", caloriesRouter);
app.use("/api/profile", profileRouter);

// Unknown API paths get a JSON 404
app.use("/api", (_req, _res, next) => next(new AppError(404, "Route not found")));

// In production the same server also serves the built React app (client/dist)
const clientDist = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        // Hashed files in /assets never change. Everything else (index.html, sw.js, manifest) must revalidate.
        const hashed = filePath.includes(`${path.sep}assets${path.sep}`);
        res.setHeader("Cache-Control", hashed ? "public, max-age=31536000, immutable" : "no-cache");
      },
    })
  );
  // Any other page URL (/plan, /history, ...) gets the app, and React Router takes over
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((_req, _res, next) => next(new AppError(404, "Route not found")));

app.use(errorHandler); // always last