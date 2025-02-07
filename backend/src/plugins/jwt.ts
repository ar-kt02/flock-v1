import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";
import dotenv from "dotenv";

dotenv.config();

declare module "fastify" {
   interface FastifyInstance {
      authenticate: any;
   }
}

export default fp(async (fastify: FastifyInstance) => {
   const secret = process.env.JWT_SECRET;

   if (!secret) {
      process.exit(1);
   }

   fastify.register(jwt, {
      secret: secret,
   });

   fastify.decorate("authenticate", async (request: any, reply: any) => {
      try {
         await request.jwtVerify();
      } catch (error) {
         reply.status(401).send({ message: "Authentication required." });
      }
   });
});
