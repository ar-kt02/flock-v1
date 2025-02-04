import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import userRoutes from "./modules/user/user.route";

const fastify = Fastify({
   logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

async function main() {
   fastify.register(userRoutes, { prefix: "/api/users" });

   try {
      await fastify.listen({ port: 3000 });
   } catch (err) {
      fastify.log.error(err);
      process.exit(1);
   }
}

main();
