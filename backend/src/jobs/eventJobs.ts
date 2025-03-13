import { FastifyInstance } from "fastify";

export async function updateExpiredEvents(fastify: FastifyInstance) {
  const result = await fastify.prisma.event.updateMany({
    where: {
      endTime: { lt: new Date() },
      isExpired: false,
    },
    data: {
      isExpired: true,
    },
  });
  return result.count;
}
