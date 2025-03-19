import { Type } from "@fastify/type-provider-typebox";

export const LogoutResponseSchema = {
  200: Type.Object({
    message: Type.String(),
  }),
  400: Type.Object({
    message: Type.String(),
  }),
  401: Type.Object({
    message: Type.String(),
  }),
  500: Type.Object({
    message: Type.String(),
  }),
};
