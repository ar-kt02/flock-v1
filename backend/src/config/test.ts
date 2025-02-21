import dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "test"}`;

dotenv.config({ path: envFile });

if (process.env.NODE_ENV === "development") {
  console.log(`Test setup environment: ${envFile}`);
}
