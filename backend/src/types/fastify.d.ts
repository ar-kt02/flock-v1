import { FastifyRequest, FastifyReply } from "fastify";
import { JWT } from "@fastify/jwt";
import { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    jwt: JWT;
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    authUser: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}
