import Fastify, { FastifyInstance } from "fastify";
import { PrismaClient, UserRole } from "@prisma/client";
import { execSync } from "child_process";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { randomUUID } from "crypto";
import jwtPlugin from "../src/plugins/jwt";

const prisma = new PrismaClient();

declare module "fastify" {
   interface FastifyInstance {
      authenticate: any;
   }
}

export type TestContext = {
   fastify: FastifyInstance;
   prisma: PrismaClient;
};

export const setupTestEnvironment = (): TestContext => {
   const fastify = Fastify({
      logger: false,
   }).withTypeProvider<TypeBoxTypeProvider>();

   fastify.register(jwtPlugin);

   return {
      fastify,
      prisma,
   };
};

export const runPrismaMigrateDev = () => {
   try {
      execSync("npx prisma migrate dev", {
         stdio: "inherit",
         env: { ...process.env },
      });
   } catch (error) {
      process.exit(1);
   }
};

export const registerAndLogin = async (
   fastify: FastifyInstance,
   prisma: PrismaClient,
   role?: UserRole
) => {
   const email = `test+${randomUUID()}@example.com`;
   const password = "password123456";

   await fastify.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
         email,
         password,
         ...(role ? { role } : {}),
      },
   });

   const loginResponse = await fastify.inject({
      method: "POST",
      url: "/api/users/login",
      payload: {
         email,
         password,
      },
   });

   const { token } = JSON.parse(loginResponse.payload);
   const user = await prisma.user.findUnique({ where: { email } });

   return { token, userId: user?.id, email };
};

export const createEventAsOrganizer = async (
   fastify: FastifyInstance,
   organizerToken: string,
   eventData?: Partial<Record<string, any>>
) => {
   const response = await fastify.inject({
      method: "POST",
      url: "/api/events",
      headers: { authorization: `Bearer ${organizerToken}` },
      payload: {
         title: "Test Event",
         startTime: new Date().toISOString(),
         endTime: new Date(Date.now() + 3600000).toISOString(),
         location: "Test Location",
         ...eventData,
      },
   });

   return JSON.parse(response.payload);
};

export const cleanupTestData = async (prisma: PrismaClient) => {
   await prisma.$transaction([
      prisma.eventAttendees.deleteMany(),
      prisma.event.deleteMany(),
      prisma.user.deleteMany(),
   ]);
};
