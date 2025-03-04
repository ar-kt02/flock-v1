import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`);
dotenv.config({ path: envPath });

import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastifyCors from "@fastify/cors";
import userRoutes from "./modules/user/user.route";
import jwtPlugin from "./plugins/jwt";
import eventRoutes from "./modules/event/event.route";
import { errorHandler } from "./utils/error-handler";
import validateEnv from "./utils/validateEnv";
import blacklistPlugin from "./plugins/blacklist";
import prismaPlugin from "./plugins/prisma";

validateEnv();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    transport:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: {
              ignore: "pid,hostname",
              colorize: true,
            },
          },
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
  await fastify.register(prismaPlugin);

  await fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  try {
    await fastify.register(blacklistPlugin);
    await fastify.register(jwtPlugin);
  } catch (err) {
    fastify.log.error(err, "Failed to register plugins");
    process.exit(1);
  }

  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(eventRoutes, { prefix: "/api/events" });

  fastify.get("/health", async () => ({ status: "ok" }));

  fastify.setErrorHandler(errorHandler);

  try {
    const port = parseInt(process.env.PORT || "3001", 10);
    const address = await fastify.listen({
      port,
      host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost",
    });

    fastify.log.info(`Server running in ${process.env.NODE_ENV || "development"} mode`);
    fastify.log.info(`Listening on ${address}`);
  } catch (err) {
    fastify.log.error(err, "Server failed to start");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error startup:", err);
  process.exit(1);
});
