import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import userRoutes from "../src/modules/user/user.route";
import { findUserByEmail } from "../src/modules/user/user.service";

const prisma = new PrismaClient();
const fastify = Fastify({
   logger: false,
}).withTypeProvider<TypeBoxTypeProvider>();

function runPrismaMigrateDev() {
   try {
      execSync("npx prisma migrate dev", { stdio: "inherit" });
   } catch (error) {
      process.exit(1);
   }
}

beforeAll(async () => {
   runPrismaMigrateDev();
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
