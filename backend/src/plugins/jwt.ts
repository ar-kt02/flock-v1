import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

declare module "fastify" {
   interface FastifyInstance {
      authenticate: any;
   }

   interface FastifyRequest {
      authUser: {
         id: string;
         email: string;
         role: UserRole;
      };
   }
}

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
         const decoded: any = fastify.jwt.decode(
            request.headers.authorization?.split(" ")[1] || ""
         );
         const id = decoded.id;
         const user = await prisma.user.findUnique({
            where: {
               id,
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
