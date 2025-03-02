import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    addTokenToBlacklist: (token: string) => Promise<void>;
    isTokenBlacklisted: (token: string) => Promise<boolean>;
  }
}

export default fp(
  async function blacklistPlugin(fastify: FastifyInstance) {
    if (!fastify.prisma) {
      fastify.decorate("prisma", new PrismaClient());
      fastify.addHook("onClose", async (instance) => {
        await instance.prisma.$disconnect();
      });
    }

    async function addTokenToBlacklist(token: string) {
      const expiresAt = new Date(Date.now() + 86400000);
      await fastify.prisma.blacklistedToken.create({
        data: {
          token,
          invalidatedAt: new Date(),
          expiresAt: expiresAt,
        },
      });
      fastify.log.info(`Token added to blacklist, expires at ${expiresAt}`);
    }

    async function isTokenBlacklisted(token: string): Promise<boolean> {
      const blacklistedToken = await fastify.prisma.blacklistedToken.findUnique({
        where: { token },
      });

      if (!blacklistedToken) {
        return false;
      }

      if (blacklistedToken.expiresAt < new Date()) {
        return false;
      }

      return true;
    }

    fastify.decorate("addTokenToBlacklist", addTokenToBlacklist);
    fastify.decorate("isTokenBlacklisted", isTokenBlacklisted);

    const cleanup = setInterval(async () => {
      try {
        const now = new Date();
        const result = await fastify.prisma.blacklistedToken.deleteMany({
          where: {
            expiresAt: {
              lt: now,
            },
          },
        });
        if (result.count > 0) {
          fastify.log.info(`Cleaned up ${result.count} expired blacklisted tokens`);
        }
      } catch (error) {
        fastify.log.error("Failed to clean up expired tokens", error);
      }
    }, 3600000);

    fastify.addHook("onClose", async () => {
      clearInterval(cleanup);
    });

    fastify.log.info("Blacklist plugin registered");
  },
  { name: "blacklist" },
);
