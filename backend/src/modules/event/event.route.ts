import { FastifyInstance } from "fastify";
import { Type, Static } from "@fastify/type-provider-typebox";
import {
  createEvent,
  getEventById,
  getAllEvents,
  updateEvent,
  deleteEvent,
  signupEvent,
  unSignEvent,
} from "./event.service";

import {
  CreateEventBodySchema,
  GetEventResponseSchema,
  EventParamsSchema,
  UpdateEventBodySchema,
} from "./schemas/event.schema";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../../utils/errors";
import { UserRole } from "@prisma/client";
import { authorizationErrorMessage, authorizeEventModification } from "../../utils/auth";

type CreateEventBody = Static<typeof CreateEventBodySchema>;
type UpdateEventBody = Static<typeof UpdateEventBodySchema>;
type EventParams = Static<typeof EventParamsSchema>;

async function eventRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Array(GetEventResponseSchema),
        },
      },
    },
    async (request, reply) => {
      try {
        const events = await getAllEvents();
        return events;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.get<{ Params: EventParams }>(
    "/:eventId",
    {
      schema: {
        params: EventParamsSchema,
        response: {
          200: GetEventResponseSchema,
          404: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      try {
        let event = await getEventById(eventId);

        if (!event) {
          throw new NotFoundError("Event not found");
        }

        const authHeader = request.headers.authorization;

        if (authHeader) {
          try {
            await fastify.authenticate(request, reply);

            if (
              request.authUser &&
              (request.authUser.role === UserRole.ADMIN ||
                event.organizerId === request.authUser.id)
            ) {
              return event;
            }
          } catch (authError) {}
        }

        const { attendees, ...eventWithoutAttendees } = event;
        return eventWithoutAttendees;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.post<{ Body: CreateEventBody }>(
    "/",
    {
      schema: {
        body: CreateEventBodySchema,
        response: {
          201: GetEventResponseSchema,
          400: Type.Object({
            message: Type.String(),
          }),
          403: Type.Object({
            message: Type.String(),
          }),
          500: Type.Object({
            message: Type.String(),
          }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const {
          title,
          description,
          startTime,
          endTime,
          location,
          imageUrl,
          maxAttendees,
          category,
        } = request.body;

        if (!request.authUser) {
          throw new UnauthorizedError("Authentication required");
        }

        if (
          request.authUser.role !== UserRole.ORGANIZER &&
          request.authUser.role !== UserRole.ADMIN
        ) {
          throw new ForbiddenError("Insufficient permissions");
        }

        const organizerId = request.authUser.id;

        const event = await createEvent(
          title,
          description || null,
          new Date(startTime),
          new Date(endTime),
          location,
          organizerId,
          imageUrl || null,
          maxAttendees || null,
          category || null,
        );

        reply.status(201).send(event);
        return;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.put<{ Params: EventParams; Body: UpdateEventBody }>(
    "/:eventId",
    {
      schema: {
        params: EventParamsSchema,
        body: UpdateEventBodySchema,
        response: {
          200: GetEventResponseSchema,
          400: Type.Object({ message: Type.String() }),
          403: Type.Object({ message: Type.String() }),
          404: Type.Object({ message: Type.String() }),
          500: Type.Object({ message: Type.String() }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { body } = request;
      const user = request.authUser;

      try {
        const validateDate = (date: any, field: string) => {
          if (!date) return undefined;
          const d = new Date(date);
          if (isNaN(d.getTime())) {
            throw new BadRequestError(`Invalid ${field} format`);
          }
          return d;
        };

        const startTime = validateDate(body.startTime, "startTime");
        const endTime = validateDate(body.endTime, "endTime");

        if (body.maxAttendees !== undefined) {
          if (typeof body.maxAttendees !== "number" || body.maxAttendees < 0) {
            throw new BadRequestError("maxAttendees must be a non-negative number");
          }
        }

        const event = await getEventById(eventId);

        if (!user) {
          throw new UnauthorizedError("Authentication required");
        }

        if (!authorizeEventModification(user, event)) {
          throw new ForbiddenError(authorizationErrorMessage("update"));
        }

        const updatedEvent = await updateEvent(
          eventId,
          body.title,
          body.description,
          startTime,
          endTime,
          body.location,
          body.imageUrl,
          body.maxAttendees,
          body.category,
        );

        return updatedEvent;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.delete<{ Params: EventParams }>(
    "/:eventId",
    {
      schema: {
        params: EventParamsSchema,
        response: {
          204: {},
          403: Type.Object({ message: Type.String() }),
          404: Type.Object({ message: Type.String() }),
          500: Type.Object({ message: Type.String() }),
        },
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const user = request.authUser;

      try {
        const event = await getEventById(eventId);

        if (!user) {
          throw new UnauthorizedError("Authentication required");
        }

        if (!authorizeEventModification(user, event)) {
          throw new ForbiddenError(authorizationErrorMessage("delete"));
        }

        await deleteEvent(eventId);
        reply.status(204).send();
        return;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.post<{ Params: EventParams }>(
    "/:eventId/signup",
    {
      schema: {
        params: EventParamsSchema,
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { eventId } = request.params;

      try {
        if (!request.authUser) {
          throw new ForbiddenError("Authentication required");
        }

        const userId = request.authUser.id;
        await signupEvent(eventId, userId);
        reply.status(200).send({ message: "Successfully signed up for the event" });
        return;
      } catch (error) {
        throw error;
      }
    },
  );

  fastify.delete<{ Params: EventParams }>(
    "/:eventId/signup",
    {
      schema: {
        params: EventParamsSchema,
      },
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { eventId } = request.params;

      try {
        if (!request.authUser) {
          throw new ForbiddenError("Authentication required");
        }
        const userId = request.authUser.id;
        await unSignEvent(eventId, userId);
        reply.status(200).send({ message: "Successfully unsigned up for the event" });
        return;
      } catch (error) {
        throw error;
      }
    },
  );
}

export default eventRoutes;
