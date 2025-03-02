import { FastifyInstance } from "fastify";
import { comparePassword, createUser, findUserByEmail } from "./user.service";
import {
  RegisterBodySchema,
  RegisterResponseSchema,
  CreateAdminBodySchema,
} from "./schemas/register.schema";
import { LoginBodySchema, LoginResponseSchema } from "./schemas/login.schema";
import { ProtectedResponseSchema } from "./schemas/protected.schema";
import { UserRole } from "@prisma/client";
import { Type } from "@fastify/type-provider-typebox";
import { isAdmin } from "../../utils/auth";

async function userRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        body: RegisterBodySchema,
        response: RegisterResponseSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      try {
        const existingUser = await findUserByEmail(fastify.prisma, email);
        if (existingUser) {
          return reply.status(400).send({ message: "Email is already taken." });
        }

        const user = await createUser(fastify.prisma, email, password, UserRole.ATTENDEE);

        return reply.status(201).send({
          id: user.id,
          email: user.email,
        });
      } catch (error) {
        return reply.status(500).send({ message: "Failed to register account." });
      }
    },
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: LoginBodySchema,
        response: LoginResponseSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      try {
        const user = await findUserByEmail(fastify.prisma, email);

        if (!user) {
          return reply.status(401).send({ message: "Invalid credentials." });
        }

        const passwordIsValid = await comparePassword(password, user.password);

        if (!passwordIsValid) {
          return reply.status(401).send({ message: "Invalid credentials." });
        }

        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });
        return reply.status(200).send({ token });
      } catch (error) {
        return reply.status(500).send({ message: "Failed to login." });
      }
    },
  );

  fastify.post(
    "/admin/create",
    {
      schema: {
        body: CreateAdminBodySchema,
        response: {
          201: RegisterResponseSchema[201],
          403: Type.Object({ message: Type.String() }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        if (!request.authUser || !isAdmin(request.authUser)) {
          return reply.status(403).send({ message: "Forbidden" });
        }

        const { email, password, role } = request.body as {
          email: string;
          password: string;
          role: UserRole;
        };

        const user = await createUser(fastify.prisma, email, password, role);
        return reply.status(201).send(user);
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.get(
    "/protected",
    {
      schema: {
        response: ProtectedResponseSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      if (!request.authUser) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      try {
        const role = request.authUser.role;
        return { role };
      } catch (error: any) {
        const message = error.message || "Failed to get user role";
        return reply.status(500).send({ message });
      }
    },
  );

  fastify.post("/logout", {}, async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(400).send({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      try {
        await fastify.addTokenToBlacklist(token);
        const isBlacklisted = await fastify.isTokenBlacklisted(token);

        return reply.status(200).send({
          message: "Successfully logged out",
          blacklisted: isBlacklisted,
        });
      } catch (err: any) {
        return reply.status(500).send({ message: "Failed to invalidate token" });
      }
    } catch (error: any) {
      return reply.status(500).send({ message: "Logout failed" });
    }
  });
}

export default userRoutes;
