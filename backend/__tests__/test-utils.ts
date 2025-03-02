import Fastify, { FastifyInstance } from "fastify";
import { PrismaClient, UserRole } from "@prisma/client";
import { execSync } from "child_process";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { randomUUID } from "crypto";
import jwtPlugin from "../src/plugins/jwt";
import blacklistPlugin from "../src/plugins/blacklist";

const prisma = new PrismaClient();

export type TestContext = {
  fastify: FastifyInstance;
  prisma: PrismaClient;
};

export const setupTestEnvironment = (): TestContext => {
  const fastify = Fastify({
    logger: false,
  }).withTypeProvider<TypeBoxTypeProvider>();
  fastify.register(blacklistPlugin);
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

export const createUserWithRole = async (
  prisma: PrismaClient,
  role: UserRole = UserRole.ATTENDEE,
) => {
  const email = `test+${randomUUID()}@example.com`;
  const password = "password123456";

  const user = await prisma.user.create({
    data: {
      email,
      password: await import("bcrypt").then((bcrypt) => bcrypt.hash(password, 12)),
      role,
    },
  });

  return { email, password, userId: user.id };
};

export const registerAndLogin = async (
  fastify: FastifyInstance,
  prisma: PrismaClient,
  role?: UserRole,
) => {
  let email: string;
  let password: string;
  let userId: string;

  if (role) {
    const user = await createUserWithRole(prisma, role);
    email = user.email;
    password = user.password;
    userId = user.userId;
  } else {
    email = `test+${randomUUID()}@example.com`;
    password = "password123456";
    const registerResponse = await fastify.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        email,
        password,
      },
    });
    const registerData = JSON.parse(registerResponse.payload);
    userId = registerData.id;
  }

  const loginResponse = await fastify.inject({
    method: "POST",
    url: "/api/users/login",
    payload: {
      email,
      password,
    },
  });

  const { token } = JSON.parse(loginResponse.payload);
  return { token, userId, email };
};

export const createEventAsOrganizer = async (
  fastify: FastifyInstance,
  organizerToken: string,
  eventData?: Partial<Record<string, any>>,
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
    prisma.blacklistedToken.deleteMany(),
    prisma.eventAttendees.deleteMany(),
    prisma.event.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

export const logoutUser = async (fastify: FastifyInstance, token: string) => {
  return fastify.inject({
    method: "POST",
    url: "/api/users/logout",
    headers: { authorization: `Bearer ${token}` },
  });
};

export const validateToken = async (fastify: FastifyInstance, token: string) => {
  const response = await fastify.inject({
    method: "GET",
    url: "/api/users/protected",
    headers: { authorization: `Bearer ${token}` },
  });
  return {
    valid: response.statusCode === 200,
    status: response.statusCode,
    payload: JSON.parse(response.payload),
  };
};
