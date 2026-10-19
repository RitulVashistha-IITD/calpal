import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("MongoDB connected");
  app.listen(env.PORT, () => console.log(`Server on http://localhost:${env.PORT}`));
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});