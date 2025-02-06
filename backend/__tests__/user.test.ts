import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import userRoutes from "../src/modules/user/user.route";
import { findUserByEmail } from "../src/modules/user/user.service";
import jwtPlugin from "../src/plugins/jwt";

const prisma = new PrismaClient();
const fastify = Fastify({
   logger: false,
}).withTypeProvider<TypeBoxTypeProvider>();

function runPrismaMigrateDev() {
   try {
      execSync("npx prisma migrate dev", {
         stdio: "inherit",
         env: {
            ...process.env,
         },
      });
   } catch (error) {
      process.exit(1);
   }
}

beforeAll(async () => {
   runPrismaMigrateDev();
   await fastify.register(jwtPlugin);
   await fastify.register(userRoutes, { prefix: "/api/users" });
   await fastify.ready();
});

afterAll(async () => {
   await prisma.$disconnect();
   await fastify.close();
});

describe("User Model", () => {
   const testEmail = "test@example.com";
   const testPassword = "password123456";

   afterEach(async () => {
      try {
         await prisma.user.delete({
            where: {
               email: testEmail,
            },
         });
      } catch (error) {
         console.log(error);
      }
   });

   describe("Register feature", () => {
      it("Should return 201 and create a new user with register endpoint", async () => {
         const response = await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         expect(response.statusCode).toBe(201);
         const payload = JSON.parse(response.payload);
         expect(payload.email).toBe(testEmail);

         const user = await findUserByEmail(testEmail);
         expect(user).toBeDefined();
      });

      it("Should return 400 if email already taken.", async () => {
         await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         const response = await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         expect(response.statusCode).toBe(400);
         const payload = JSON.parse(response.payload);
         expect(payload.message).toBe("Email is already taken.");
      });
   });

   describe("Login feature", () => {
      it("Should return 200 and a JWT token on successful login", async () => {
         await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         const response = await fastify.inject({
            method: "POST",
            url: "/api/users/login",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         expect(response.statusCode).toBe(200);

         const payload = JSON.parse(response.payload);
         expect(payload.token).toBeDefined();
      });

      it("Should return 401 for invalid login credentials", async () => {
         await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         const response = await fastify.inject({
            method: "POST",
            url: "/api/users/login",
            payload: {
               email: "wrong@example.com",
               password: "wrongpass",
            },
         });

         expect(response.statusCode).toBe(401);
         const payload = JSON.parse(response.payload);
         expect(payload.message).toBe("Invalid credentials.");
      });

      it("Should be able to access protected route with valid JWT token", async () => {
         await fastify.inject({
            method: "POST",
            url: "/api/users/register",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         const loginResponse = await fastify.inject({
            method: "POST",
            url: "/api/users/login",
            payload: {
               email: testEmail,
               password: testPassword,
            },
         });

         expect(loginResponse.statusCode).toBe(200);
         const loginPayload = JSON.parse(loginResponse.payload);
         expect(loginPayload.token).toBeDefined();

         const protectedResponse = await fastify.inject({
            method: "GET",
            url: "/api/users/protected",
            headers: {
               authorization: `Bearer ${loginPayload.token}`,
            },
         });

         expect(protectedResponse.statusCode).toBe(200);
         const protecedPayload = JSON.parse(protectedResponse.payload);
         expect(protecedPayload.message).toBe(
            "Successfully accessed protected route."
         );
      });

      it("should return 401 when accessing protected route without valid JWT token", async () => {
         const protectedResponse = await fastify.inject({
            method: "GET",
            url: "/api/users/protected",
         });

         expect(protectedResponse.statusCode).toBe(401);
         const protecedPayload = JSON.parse(protectedResponse.payload);
         expect(protecedPayload.message).toBe("Authentication required.");
      });
   });
});
