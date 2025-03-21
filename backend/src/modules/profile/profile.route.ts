import { FastifyInstance } from "fastify";
import { GetProfileParamsSchema, getProfileResponseSchema } from "./schemas/profile.schema";
import { getProfileByUserId } from "./profile.service";
import { ForbiddenError } from "../../utils/errors";

async function profileRoutes(fastify: FastifyInstance) {
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
}

export default profileRoutes;
