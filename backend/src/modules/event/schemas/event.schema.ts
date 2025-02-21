import { Type } from "@fastify/type-provider-typebox";

const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
});

const EventAttendeesSchema = Type.Object({
  eventId: Type.String(),
  userId: Type.String(),
  user: UserSchema,
});

export const GetEventResponseSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  startTime: Type.String(),
  endTime: Type.String(),
  location: Type.String(),
  imageUrl: Type.Optional(Type.String()),
  maxAttendees: Type.Optional(Type.Number()),
  category: Type.Optional(Type.String()),
  organizerId: Type.String(),
  attendees: Type.Optional(Type.Array(EventAttendeesSchema)),
});

export const CreateEventBodySchema = Type.Object({
  title: Type.String(),
  description: Type.Optional(Type.String()),
  startTime: Type.String(),
  endTime: Type.String(),
  location: Type.String(),
  imageUrl: Type.Optional(Type.String()),
  maxAttendees: Type.Optional(Type.Number()),
  category: Type.Optional(Type.String()),
});

export const UpdateEventBodySchema = Type.Object({
  title: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  startTime: Type.Optional(Type.String()),
  endTime: Type.Optional(Type.String()),
  location: Type.Optional(Type.String()),
  imageUrl: Type.Optional(Type.String()),
  maxAttendees: Type.Optional(Type.Number()),
  category: Type.Optional(Type.String()),
});

export const EventParamsSchema = Type.Object({
  eventId: Type.String(),
});
