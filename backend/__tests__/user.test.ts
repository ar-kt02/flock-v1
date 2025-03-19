import {
  setupTestEnvironment,
  cleanupTestData,
  registerAndLogin,
  TestContext,
  validateToken,
  logoutUser,
} from "./test-utils";
import { UserRole } from "@prisma/client";
import { findUserByEmail } from "../src/modules/user/user.service";
import userRoutes from "../src/modules/user/user.route";

describe("User Auth", () => {
  let context: TestContext;
  let adminToken: string;
  let organizerToken: string;
  let attendeeToken: string;

  beforeAll(async () => {
    context = setupTestEnvironment();
    await context.fastify.register(userRoutes, { prefix: "/api/users" });
    await context.fastify.ready();
  });

  beforeEach(async () => {
    const admin = await registerAndLogin(context.fastify, context.prisma, UserRole.ADMIN);
    adminToken = admin.token;

    const organizer = await registerAndLogin(context.fastify, context.prisma, UserRole.ORGANIZER);
    organizerToken = organizer.token;

    const attendee = await registerAndLogin(context.fastify, context.prisma, UserRole.ATTENDEE);
    attendeeToken = attendee.token;
  });

  afterEach(async () => {
    await cleanupTestData(context.prisma);
  });

  afterAll(async () => {
    await context.prisma.$disconnect();
    await context.fastify.close();
  });

  describe("User Registration", () => {
    it("Should return 201 and create a new user with register endpoint", async () => {
      const testEmail = `test+${Date.now()}@example.com`;
      const testPassword = "ValidPassword123!";
      const response = await context.fastify.inject({
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

      const user = await findUserByEmail(context.prisma, testEmail);
      expect(user).toBeDefined();
    });

    it("Should return 400 if email already taken.", async () => {
      const testEmail = `test+${Date.now()}@example.com`;
      const testPassword = "ValidPassword123!";
      await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      const response = await context.fastify.inject({
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

    it("should create user with ATTENDEE role by default", async () => {
      const email = `test+${Date.now()}@example.com`;
      const response = await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email,
          password: "ValidPassword123!",
        },
      });

      expect(response.statusCode).toBe(201);
      const user = await findUserByEmail(context.prisma, email);
      expect(user?.role).toBe(UserRole.ATTENDEE);
    });

    it("should enforce basic password complexity requirements", async () => {
      const response = await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: "weakpass@example.com",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).message).toMatch(
        "body/password must NOT have fewer than 8 characters",
      );
    });
  });

  describe("User Login", () => {
    const testEmail = `test+${Date.now()}@example.com`;
    const testPassword = "ValidPassword123!";
    it("Should return 200 and a JWT token on successful login", async () => {
      await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      const response = await context.fastify.inject({
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
      await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: testEmail,
          password: testPassword,
        },
      });

      const response = await context.fastify.inject({
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
  });

  describe("Admin Creation", () => {
    it("should prevent public users (no auth bearer) from creating admin accounts", async () => {
      const response = await context.fastify.inject({
        method: "POST",
        url: "/api/users/admin/create",
        payload: {
          email: "admin@example.com",
          password: "SecurePassword123!",
          role: UserRole.ADMIN,
        },
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.payload).message).toBe("Missing authentication token");
    });

    it("should prevent non-admin authenticated users from creating admin accounts", async () => {
      const organizerResponse = await context.fastify.inject({
        method: "POST",
        url: "/api/users/admin/create",
        headers: { authorization: `Bearer ${organizerToken}` },
        payload: {
          email: "admin2@example.com",
          password: "SecurePassword123!",
          role: UserRole.ADMIN,
        },
      });
      expect(organizerResponse.statusCode).toBe(403);
      expect(JSON.parse(organizerResponse.payload).message).toBe("Forbidden");

      const attendeeResponse = await context.fastify.inject({
        method: "POST",
        url: "/api/users/admin/create",
        headers: { authorization: `Bearer ${attendeeToken}` },
        payload: {
          email: "admin3@example.com",
          password: "SecurePassword123!",
          role: UserRole.ADMIN,
        },
      });
      expect(JSON.parse(attendeeResponse.payload).message).toBe("Forbidden");
      expect(attendeeResponse.statusCode).toBe(403);
    });

    it("should allow admins to create privileged accounts", async () => {
      const testEmail = `newadmin+${Date.now()}@example.com`;
      const response = await context.fastify.inject({
        method: "POST",
        url: "/api/users/admin/create",
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          email: testEmail,
          password: "SecurePassword123!",
          role: UserRole.ADMIN,
        },
      });

      expect(response.statusCode).toBe(201);
      const user = await findUserByEmail(context.prisma, testEmail);
      expect(user?.role).toBe(UserRole.ADMIN);
    });

    it("should validate admin creation input", async () => {
      const tests = [
        {
          payload: { email: "invalid-email", password: "ValidPass123!", role: UserRole.ADMIN },
          expectedError: "body/email must match format",
        },
        {
          payload: { email: "valid@example.com", password: "short", role: UserRole.ADMIN },
          expectedError: "password must NOT have fewer than",
        },
        {
          payload: { email: "valid@example.com", password: "ValidPass123!", role: "INVALID_ROLE" },
          expectedError: "body/role must match a schema",
        },
      ];

      for (const test of tests) {
        const response = await context.fastify.inject({
          method: "POST",
          url: "/api/users/admin/create",
          headers: { authorization: `Bearer ${adminToken}` },
          payload: test.payload,
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.payload).message).toContain(test.expectedError);
      }
    });
  });

  describe("Role-based Access", () => {
    it("should prevent admin creation through public registration", async () => {
      const response = await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: `public+${Date.now()}@example.com`,
          password: "Password123!",
          role: UserRole.ADMIN,
        },
      });

      expect(response.statusCode).toBe(201);
      const user = await findUserByEmail(context.prisma, JSON.parse(response.payload).email);
      expect(user?.role).toBe(UserRole.ATTENDEE);
    });

    it("should include user role in JWT claims", async () => {
      const response = await registerAndLogin(context.fastify, context.prisma);
      const { token } = response;
      const decoded = context.fastify.jwt.decode(token);
      expect(decoded).toHaveProperty("role");
    });
  });

  describe("Authentication System", () => {
    it("should reject invalid JWT tokens", async () => {
      const response = await context.fastify.inject({
        method: "GET",
        url: "/api/users/protected",
        headers: { authorization: "Bearer invalid.token.here" },
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.payload).message).toBe("Invalid authentication token");
    });

    it("should return 401 when accessing protected route without valid JWT token", async () => {
      const protectedResponse = await context.fastify.inject({
        method: "GET",
        url: "/api/users/protected",
      });

      expect(protectedResponse.statusCode).toBe(401);
      expect(JSON.parse(protectedResponse.payload).message).toBe("Missing authentication token");
    });

    it("Should be able to access protected route with valid JWT token", async () => {
      const email = `test+${Date.now()}@example.com`;
      await context.fastify.inject({
        method: "POST",
        url: "/api/users/register",
        payload: {
          email: email,
          password: "ValidPassword123!",
        },
      });

      const loginResponse = await context.fastify.inject({
        method: "POST",
        url: "/api/users/login",
        payload: {
          email: email,
          password: "ValidPassword123!",
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginPayload = JSON.parse(loginResponse.payload);
      expect(loginPayload.token).toBeDefined();

      const protectedResponse = await context.fastify.inject({
        method: "GET",
        url: "/api/users/protected",
        headers: {
          authorization: `Bearer ${loginPayload.token}`,
        },
      });

      expect(protectedResponse.statusCode).toBe(200);
      const protecedPayload = JSON.parse(protectedResponse.payload);
      // expect(protecedPayload.message).toBe("Successfully accessed protected route.");
      expect(protecedPayload).toHaveProperty("role");
    });
  });

  describe("Logout Functionality", () => {
    it("Should successfully logout a user and invalidate JWT", async () => {
      const { token } = await registerAndLogin(context.fastify, context.prisma);

      let validationResult = await validateToken(context.fastify, token);
      expect(validationResult.valid).toBe(true);

      const logoutResponse = await logoutUser(context.fastify, token);
      expect(logoutResponse.statusCode).toBe(200);

      validationResult = await validateToken(context.fastify, token);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.status).toBe(401);
    });
  });
});
