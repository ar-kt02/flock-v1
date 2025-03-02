import { Type } from "@fastify/type-provider-typebox";

export const ProtectedResponseSchema = {
  200: Type.Object({ role: Type.String() }),
  500: Type.Object({ message: Type.String() }),
  401: Type.Object({ message: Type.String() }),
};
