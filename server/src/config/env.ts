import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
});

// Crash at startup if config is wrong, instead of failing mysteriously later.
export const env = schema.parse(process.env);