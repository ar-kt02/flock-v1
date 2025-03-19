import dotenv from "dotenv";
import path from "path";

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import userRoutes from "./modules/user/user.route";
import eventRoutes from "./modules/event/event.route";
import jwtPlugin from "./plugins/jwt";
import blacklistPlugin from "./plugins/blacklist";
import prismaPlugin from "./plugins/prisma";
import schedulerPlugin from "./jobs/scheduler";
import { errorHandler } from "./utils/error-handler";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import validateEnv from "./utils/validateEnv";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifySwagger from "@fastify/swagger";

const envPath = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`);
dotenv.config({ path: envPath });
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
  try {
    await fastify.register(fastifyCors, {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    });
    await fastify.register(prismaPlugin);
    await fastify.register(schedulerPlugin);
    await fastify.register(blacklistPlugin);
    await fastify.register(jwtPlugin);

    const port = parseInt(process.env.PORT || "3001", 10);

    if (process.env.NODE_ENV !== "production") {
      await fastify.register(fastifySwagger, {
        mode: "dynamic",
        openapi: {
          info: {
            title: "Event API Documentation",
            version: "1.0.0",
          },
          servers: [
            {
              url: `http://localhost:${port}`,
              description: "Development Server",
            },
            {
              url: `http://127.0.0.1:${port}`,
              description: "Development Server (IP)",
            },
          ],
          components: {
            securitySchemes: {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
              },
            },
          },
        },
      });

      await fastify.register(fastifySwaggerUi, {
        routePrefix: "/docs",
        uiConfig: {
          docExpansion: "list",
          deepLinking: false,
        },
      });

      fastify.log.info(`Swagger documentation at http://127.0.0.1:${port}/docs`);
    }

    await fastify.register(userRoutes, { prefix: "/api/users" });
    await fastify.register(eventRoutes, { prefix: "/api/events" });

    fastify.setErrorHandler(errorHandler);
    fastify.get("/health", async () => ({ status: "ok" }));

    const address = await fastify.listen({
      port,
      host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost",
    });

    fastify.log.info(`Server running in ${process.env.NODE_ENV || "development"}`);
    fastify.log.info(`Listening on ${address}`);

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, async () => {
        fastify.log.info(`${signal} received, shutting down server`);
        await fastify.close();
        process.exit(0);
      });
    });
  } catch (err) {
    fastify.log.error(err, "Server failed to start");
    await fastify.close();
    process.exit(1);
  }
}

main();
