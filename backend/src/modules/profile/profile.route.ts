import { FastifyInstance } from "fastify";
import {
  GetProfileParamsSchema,
  getProfileResponseSchema,
  updateProfileBodySchema,
  updateProfileResponseSchema,
} from "./schemas/profile.schema";
import { getProfileByUserId, updateProfile } from "./profile.service";
import { ForbiddenError } from "../../utils/errors";

async function profileRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ["profile"],
        response: getProfileResponseSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const profile = await getProfileByUserId(fastify.prisma, request.authUser.id);

      return reply.status(200).send({
        userId: profile.userId,
        email: profile.email,
        firstName: profile.firstName,
        surname: profile.surname,
        phoneNumber: profile.phoneNumber,
        location: profile.location,
        interests: profile.interests,
      });
    },
  );

  fastify.get(
    "/:userId",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ["profile"],
        params: GetProfileParamsSchema,
        response: getProfileResponseSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const { userId } = request.params as { userId: string };

      const profile = await getProfileByUserId(fastify.prisma, userId);

      if (profile.userId !== request.authUser.id && request.authUser.role !== "ADMIN") {
        throw new ForbiddenError();
      }

      return reply.status(200).send({
        userId: profile.userId,
        email: profile.email,
        firstName: profile.firstName,
        surname: profile.surname,
        phoneNumber: profile.phoneNumber,
        location: profile.location,
        interests: profile.interests,
      });
    },
  );

  fastify.put(
    "/",
    {
      schema: {
        security: [{ bearerAuth: [] }],
        tags: ["profile"],
        body: updateProfileBodySchema,
        response: updateProfileResponseSchema,
      },
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const updateData = request.body as {
        email?: string;
        firstName?: string;
        surname?: string;
        phoneNumber?: string;
        location?: string;
        interests?: string[];
      };

      const currentProfile = await getProfileByUserId(fastify.prisma, request.authUser.id);

      const updatedProfile = await updateProfile(fastify.prisma, currentProfile.userId, updateData);

      return reply.status(200).send({
        userId: updatedProfile.userId,
        email: updatedProfile.email,
        firstName: updatedProfile.firstName,
        surname: updatedProfile.surname,
        phoneNumber: updatedProfile.phoneNumber,
        location: updatedProfile.location,
        interests: updatedProfile.interests,
      });
    },
  );
}

export default profileRoutes;
