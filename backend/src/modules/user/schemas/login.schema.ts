import { Type } from "@fastify/type-provider-typebox";

export const LoginBodySchema = Type.Object({
   email: Type.String({ format: "email" }),
   password: Type.String(),
});

export const LoginResponseSchema = {
   200: Type.Object({ token: Type.String() }),
   401: Type.Object({ message: Type.String() }),
   500: Type.Object({ message: Type.String() }),
};
