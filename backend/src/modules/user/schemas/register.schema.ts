import { Type } from "@fastify/type-provider-typebox";

export const RegisterBodySchema = Type.Object({
   email: Type.String({ format: "email" }),
   password: Type.String({ minLength: 8 }),
});

export const RegisterResponseSchema = {
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
};

export const CreateAdminBodySchema = Type.Object({
   email: Type.String({ format: "email" }),
   password: Type.String({ minLength: 8 }),
   role: Type.Enum({
      ATTENDEE: "ATTENDEE",
      ORGANIZER: "ORGANIZER",
      ADMIN: "ADMIN",
   }),
});
