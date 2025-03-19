import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { isPublicRoute } from "../config/public-route";
import { UnauthorizedError } from "../utils/errors";

export default fp(
  async (fastify: FastifyInstance) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      fastify.log.error("JWT_SECRET environment variable is not set!");
      throw new Error("JWT_SECRET environment variable is not set!");
    }

    await fastify.register(jwt, {
      secret,
      sign: {
        expiresIn: "7d",
      },
      verify: {
        ignoreExpiration: false,
      },
    });

    const verifyAuth = async (request: any, reply: any, skipUserLookup = false) => {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing authentication token");
      }

      const token = authHeader.split(" ")[1];
      if (await fastify.isTokenBlacklisted(token)) {
        throw new UnauthorizedError("Authentication token has been revoked");
      }

      try {
        await request.jwtVerify();
      } catch (err: any) {
        throw new UnauthorizedError("Invalid authentication token");
      }

      if (!skipUserLookup) {
        const user = await fastify.prisma.user.findUnique({
          where: { id: request.user.id },
        });

        if (!user) {
          throw new UnauthorizedError("User not found");
        }

        request.authUser = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    };

    fastify.decorate("authenticate", async (request: any, reply: any) => {
      try {
        await verifyAuth(request, reply, false);
      } catch (err: any) {
        reply.send(err);
      }
    });

    fastify.addHook("onRequest", async (request, reply) => {
      if (!request.url.startsWith("/api/")) return;

      if (isPublicRoute(request.url, request.method) || request.url === "/api/users/logout") {
        fastify.log.info(`Skipping auth for route: ${request.url}`);
        return;
      }

      try {
        await verifyAuth(request, reply, true);
      } catch (err: any) {
        reply.send(err);
      }
    });

    fastify.log.info("JWT plugin registered");
  },
  { name: "jwt", dependencies: ["blacklist"] },
);
