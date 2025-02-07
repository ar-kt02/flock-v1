import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import userRoutes from "./modules/user/user.route";
import jwtPlugin from "./plugins/jwt";
import { config } from "./config/index";

const fastify = Fastify({
   logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
   await fastify.register(jwtPlugin, { secret: config.JWT_SECRET });
   fastify.register(userRoutes, { prefix: "/api/users" });

   try {
      const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
      await fastify.listen({ port: port });
   } catch (err) {
      fastify.log.error(err);
      process.exit(1);
   }
}

main();
