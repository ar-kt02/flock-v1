import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { isPublicRoute } from "../config/public-route";

export default fp(
  async (fastify: FastifyInstance) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      fastify.log.error("JWT_SECRET environment variable is not set!");
      throw new Error("JWT_SECRET environment variable is not set!");
    }

    await fastify.register(jwt, { secret });

    fastify.decorate("authenticate", async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
        const token = request.headers.authorization?.split(" ")[1];

        if (!token) throw new Error("Missing token");
        if (await fastify.isTokenBlacklisted(token)) throw new Error("Token revoked");

        const user = await fastify.prisma.user.findUnique({
          where: { id: request.user.id },
        });

        if (!user) throw new Error("User not found");

        request.authUser = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      } catch (err: any) {
        fastify.log.info(`Auth required for: ${request.url}`);
        reply.status(401).send({ message: "Authentication required." });
      }
    });

    fastify.addHook("onRequest", async (request, reply) => {
      if (!request.url.startsWith("/api/")) return;
      if (isPublicRoute(request.url, request.method)) {
        fastify.log.info(`Skipping auth for public route: ${request.url}`);
        return;
      }
      if (request.url === "/api/users/logout") return;

      try {
        await request.jwtVerify();
        const token = request.headers.authorization?.split(" ")[1];
        if (token && (await fastify.isTokenBlacklisted(token))) {
          throw new Error("Token revoked");
        }
      } catch (err: any) {
        fastify.log.info(`Auth required for: ${request.url}`);
        reply.status(401).send({ message: "Authentication required" });
      }
    });

    fastify.log.info("JWT plugin registered");
  },
  { name: "jwt", dependencies: ["blacklist"] },
);
