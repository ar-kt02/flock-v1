import { FastifyInstance } from "fastify";
import { Type } from "@fastify/type-provider-typebox";
import { createUser, findUserByEmail } from "./user.service";

async function userRoutes(fastify: FastifyInstance) {
   fastify.post(
      "/register",
      {
         schema: {
            body: Type.Object({
               email: Type.String({ format: "email" }),
               password: Type.String({ minLength: 8 }),
            }),
            response: {
               201: Type.Object({
                  id: Type.String(),
                  email: Type.String({ format: "email" }),
               }),
               400: Type.Object({
                  message: Type.String(),
               }),
               500: Type.Object({
                  message: Type.String(),
               }),
            },
         },
      },
      async (request, reply) => {
         const { email, password } = request.body as {
            email: string;
            password: string;
         };
         try {
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
               return reply
                  .status(400)
                  .send({ message: "Email is already taken." });
            }

            const user = await createUser(email, password);

            return reply.status(201).send({
               id: user.id,
               email: user.email,
            });
         } catch (error) {
            return reply
               .status(500)
               .send({ message: "Failed to register account." });
         }
      }
   );
}

export default userRoutes;
