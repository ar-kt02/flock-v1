import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../../utils/errors";

const prisma = new PrismaClient();

export const createEvent = async (
   title: string,
   description: string | null,
   startTime: Date,
   endTime: Date,
   location: string,
   organizerId: string,
   imageUrl?: string | null,
   maxAttendees?: number | null,
   category?: string | null
) => {
   try {
      const event = await prisma.event.create({
         data: {
            title,
            description,
            startTime,
            endTime,
            location,
            organizerId,
            imageUrl,
            maxAttendees,
            category,
         },
      });
      return event;
   } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
         throw new BadRequestError("Invalid data provided for event creation");
      }
      throw new Error("Failed to create event");
   }
};

export const getEventById = async (eventId: string) => {
   try {
      const event = await prisma.event.findUnique({
         where: { id: eventId },
         include: { attendees: { include: { user: true } } },
      });

      if (!event) {
         throw new NotFoundError("Event not found");
      }

      return event;
   } catch (error) {
      throw error;
   }
};

export const getAllEvents = async () => {
   try {
      const events = await prisma.event.findMany();
      return events;
   } catch (error) {
      throw new Error("Failed to get all events");
   }
};

export const updateEvent = async (
   eventId: string,
   title?: string,
   description?: string | null,
   startTime?: Date,
   endTime?: Date,
   location?: string,
   imageUrl?: string | null,
   maxAttendees?: number | null,
   category?: string | null
) => {
   try {
      await getEventById(eventId);

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;
      if (location !== undefined) updateData.location = location;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees;
      if (category !== undefined) updateData.category = category;

      const updatedEvent = await prisma.event.update({
         where: { id: eventId },
         data: updateData,
      });

      return updatedEvent;
   } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === "P2025") {
            throw new NotFoundError("Event not found");
         }
      }
      throw error;
   }
};

export const deleteEvent = async (eventId: string) => {
   try {
      await getEventById(eventId);
      await prisma.event.delete({ where: { id: eventId } });
   } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === "P2025") {
            throw new NotFoundError("Event not found");
         }
      }
      throw error;
   }
};

export const signupEvent = async (eventId: string, userId: string) => {
   try {
      const event = await prisma.event.findUnique({
         where: { id: eventId },
         include: { attendees: true },
      });

      if (!event) {
         throw new NotFoundError("Event not found");
      }

      if (event?.maxAttendees && event.attendees.length >= event.maxAttendees) {
         throw new Error("Event is full");
      }

      const existing = await prisma.eventAttendees.findUnique({
         where: { eventId_userId: { eventId, userId } },
      });
      if (existing) throw new Error("Already signed up");

      const eventAttendees = await prisma.eventAttendees.create({
         data: {
            eventId: eventId,
            userId: userId,
         },
      });
      return eventAttendees;
   } catch (error) {
      throw error;
   }
};

export const unSignEvent = async (eventId: string, userId: string) => {
   try {
      const existing = await prisma.eventAttendees.findUnique({
         where: { eventId_userId: { eventId, userId } },
      });

      if (!existing) {
         throw new Error("Not sign up");
      }
      await prisma.eventAttendees.delete({
         where: {
            eventId_userId: {
               eventId: eventId,
               userId: userId,
            },
         },
      });
   } catch (error) {
      throw error;
   }
};
