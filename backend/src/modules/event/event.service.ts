import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../../utils/errors";

export const createEvent = async (
  prisma: PrismaClient,
  title: string,
  description: string | null,
  startTime: Date,
  endTime: Date,
  location: string,
  organizerId: string,
  imageUrl?: string | null,
  maxAttendees?: number | null,
  category?: string | null,
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

export const getEventById = async (prisma: PrismaClient, eventId: string) => {
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

export const getAllEvents = async (
  prisma: PrismaClient,
  skip?: number,
  limit?: number,
  isExpired: boolean = false,
) => {
  try {
    const where: Prisma.EventWhereInput = {
      isExpired: isExpired,
    };

    const events = await prisma.event.findMany({
      where,
      skip,
      take: limit,
    });
    return events;
  } catch (error) {
    throw new Error("Failed to get all events");
  }
};

export const getEventsByUserId = async (prisma: PrismaClient, userId: string) => {
  try {
    const eventAttendees = await prisma.eventAttendees.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const events = eventAttendees.map((attendee) => attendee.event);
    return events;
  } catch (error) {
    throw new Error("Failed to get user's events");
  }
};

export const getEventsByOrganizerId = async (prisma: PrismaClient, organizerId: string) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId },
    });
    return events;
  } catch (error) {
    throw new Error("Failed to get events by organizer ID");
  }
};

export const updateEvent = async (
  prisma: PrismaClient,
  eventId: string,
  title?: string,
  description?: string | null,
  startTime?: Date,
  endTime?: Date,
  location?: string,
  imageUrl?: string | null,
  maxAttendees?: number | null,
  category?: string | null,
) => {
  try {
    await getEventById(prisma, eventId);

    const updateData = Prisma.validator<Prisma.EventUpdateInput>()({
      title,
      description,
      startTime,
      endTime,
      location,
      imageUrl,
      maxAttendees,
      category,
    });

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

export const deleteEvent = async (prisma: PrismaClient, eventId: string) => {
  try {
    await getEventById(prisma, eventId);
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

export const signupEvent = async (prisma: PrismaClient, eventId: string, userId: string) => {
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

export const unSignEvent = async (prisma: PrismaClient, eventId: string, userId: string) => {
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
