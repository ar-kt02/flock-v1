import cron from "node-cron";
import fp from "fastify-plugin";
import { updateExpiredEvents } from "./eventJobs";
import { FastifyInstance } from "fastify";

export default fp(async (fastify: FastifyInstance) => {
  try {
    const count = await updateExpiredEvents(fastify);

    if (count > 0) {
      fastify.log.info(`Startup: Updated ${count} expired events to expired status`);
    }
  } catch (error) {
    fastify.log.error(`Startup: Error updating expired events: ${error}`);
  }

  cron.schedule("0 0 * * *", async () => {
    try {
      const count = await updateExpiredEvents(fastify);
      if (count > 0) {
        fastify.log.info(`Cron: Updated ${count} expired events to expired status`);
      }
    } catch (error) {
      fastify.log.error(`Cron: Error updating expired events: ${error}`);
    }
  });
});
