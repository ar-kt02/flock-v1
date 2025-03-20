import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
    fastify.log.info("Prisma client disconnected");
  });
});
