import dotenv from "dotenv";
import { z } from "zod";

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const envSchema = z.object({
   NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
   DATABASE_URL: z.string().url(),
   JWT_SECRET: z.string(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
   console.error("Invalid environment variables:", env.error.format());
   throw new Error("Invalid environment variables. Check your .env file.");
}

export const config = env.data;
