import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default fp(async (fastify: FastifyInstance) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET environment variable is not set!");
    process.exit(1);
  }

  fastify.register(jwt, {
    secret: secret,
  });

  fastify.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      const user = await prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
      });
      if (!user) {
        return reply.status(401).send({ message: "Invalid token" });
      }
      request.authUser = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (err: any) {
      reply.status(401).send({ message: "Authentication required." });
    }
  });
});
