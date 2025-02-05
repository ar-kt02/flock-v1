import { Type } from "@fastify/type-provider-typebox";

export const ProtectedResponseSchema = {
   200: Type.Object({ message: Type.String() }),
};
