import { Type } from "@fastify/type-provider-typebox";

export const GetProfileParamsSchema = Type.Object({
  userId: Type.String({ description: "The User ID of the profile to retrieve" }),
});

export const getProfileResponseSchema = {
  200: Type.Object(
    {
      userId: Type.String({ description: "The User ID of the profile" }),
      email: Type.String({ description: "The email of the user" }),
      firstName: Type.String({ description: "The first name of the profile" }),
      surname: Type.String({ description: "The surname of the profile" }),
      phoneNumber: Type.String({ description: "The phone number of the profile" }),
      location: Type.String({ description: "The location of the profile" }),
      interests: Type.Array(Type.String(), { description: "The interests of the profile" }),
    },
    { description: "Successful response containing the profile data" },
  ),
  401: Type.Object(
    {
      message: Type.String({ description: "Missing or invalid authentication token" }),
    },
    { description: "Missing or invalid authentication token" },
  ),
  403: Type.Object(
    {
      message: Type.String({ description: "Forbidden" }),
    },
    { description: "Forbidden" },
  ),
  404: Type.Object(
    {
      message: Type.String({ description: "Profile not found" }),
    },
    { description: "Profile not found" },
  ),
  500: Type.Object(
    {
      message: Type.String({ description: "Internal server error" }),
    },
    { description: "Internal server error" },
  ),
};

export const updateProfileBodySchema = Type.Object({
  email: Type.Optional(
    Type.String({
      description: "The email of the user to update",
      format: "email",
    }),
  ),
  firstName: Type.Optional(Type.String({ description: "The first name of the profile to update" })),
  surname: Type.Optional(Type.String({ description: "The surname of the profile to update" })),
  phoneNumber: Type.Optional(
    Type.String({
      description: "The phone number of the profile to update",
      minLength: 10,
    }),
  ),
  location: Type.Optional(Type.String({ description: "The location of the profile to update" })),
  interests: Type.Optional(
    Type.Array(Type.String(), { description: "The interests of the profile to update" }),
  ),
});

export const updateProfileResponseSchema = {
  200: Type.Object(
    {
      userId: Type.String({ description: "The User ID of the profile" }),
      email: Type.String({ description: "The email of the user" }),
      firstName: Type.String({ description: "The first name of the profile" }),
      surname: Type.String({ description: "The surname of the profile" }),
      phoneNumber: Type.String({ description: "The phone number of the profile" }),
      location: Type.String({ description: "The location of the profile" }),
      interests: Type.Array(Type.String(), { description: "The interests of the profile" }),
    },
    { description: "Successful response containing updated profile data" },
  ),
  400: Type.Object(
    {
      message: Type.String({ description: "Bad Request" }),
    },
    { description: "Bad Request" },
  ),
  401: Type.Object(
    {
      message: Type.String({ description: "Missing or invalid authentication token" }),
    },
    { description: "Missing or invalid authentication token" },
  ),
  403: Type.Object(
    {
      message: Type.String({ description: "Forbidden" }),
    },
    { description: "Forbidden" },
  ),
  404: Type.Object(
    {
      message: Type.String({ description: "Profile not found" }),
    },
    { description: "Profile not found" },
  ),
  500: Type.Object(
    {
      message: Type.String({ description: "Internal server error" }),
    },
    { description: "Internal server error" },
  ),
};
