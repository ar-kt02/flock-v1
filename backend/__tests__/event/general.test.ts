import {
  setupTestEnvironment,
  runPrismaMigrateDev,
  cleanupTestData,
  createEventAsOrganizer,
  TestContext,
  registerAndLogin,
} from "../test-utils";
import { UserRole } from "@prisma/client";
import userRoutes from "../../src/modules/user/user.route";
import eventRoutes from "../../src/modules/event/event.route";

describe("Event API - General", () => {
  let context: TestContext;
  let testEvent: any;

  beforeAll(async () => {
    context = setupTestEnvironment();
    runPrismaMigrateDev();

    await context.fastify.register(userRoutes, { prefix: "/api/users" });
    await context.fastify.register(eventRoutes, { prefix: "/api/events" });
    await context.fastify.ready();

    const organizer = await registerAndLogin(context.fastify, context.prisma, UserRole.ORGANIZER);
    testEvent = await createEventAsOrganizer(context.fastify, organizer.token);
  });

  afterAll(async () => {
    await cleanupTestData(context.prisma);
    await context.prisma.$disconnect();
    await context.fastify.close();
  });

  it("should retrieve all events without authentication", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: "/api/events",
    });

    expect(response.statusCode).toBe(200);
    const events = JSON.parse(response.payload);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].attendees).toBeUndefined();
  });

  it("should get event details without sensitive info for public", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: `/api/events/${testEvent.id}`,
    });

    const event = JSON.parse(response.payload);
    expect(response.statusCode).toBe(200);
    expect(event.title).toBe(testEvent.title);
    expect(event.attendees).toBeUndefined();
  });

  it("should return 404 for non-existent event", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await context.fastify.inject({
      method: "GET",
      url: `/api/events/${fakeId}`,
    });
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.payload).message).toBe("Event not found");
  });

  it("should prevent users from creating, updating, deleting events without valid organizer/admin bearer token", async () => {
    const createResponse = await context.fastify.inject({
      method: "POST",
      url: "/api/events",
      payload: {
        title: "New Conference",
        description: "Annual Tech Conference",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: "Convention Center",
        imageUrl: "http://example.com/conference.jpg",
        maxAttendees: 1000,
        category: "Technology",
      },
    });

    const updateResponse = await context.fastify.inject({
      method: "PUT",
      url: `/api/events/${testEvent.id}`,
      payload: { title: "Hacked Event" },
    });

    const deleteResponse = await context.fastify.inject({
      method: "DELETE",
      url: `/api/events/${testEvent.id}`,
    });

    const responses = [createResponse, updateResponse, deleteResponse];

    responses.forEach((response) => {
      expect(JSON.parse(response.payload).message).toBe("Missing authentication token");
    });
  });

  it("should prevent public users from creating events", async () => {
    const { token } = await registerAndLogin(context.fastify, context.prisma, UserRole.ATTENDEE);

    const response = await context.fastify.inject({
      method: "POST",
      url: "/api/events",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: "New Conference",
        description: "Annual Tech Conference",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: "Convention Center",
        imageUrl: "http://example.com/conference.jpg",
        maxAttendees: 1000,
        category: "Technology",
      },
    });

    expect(JSON.parse(response.payload).message.includes("Insufficient permissions")).toBe(true);
  });

  it("should prevent public users from updating events", async () => {
    const { token } = await registerAndLogin(context.fastify, context.prisma, UserRole.ATTENDEE);

    const response = await context.fastify.inject({
      method: "PUT",
      url: `/api/events/${testEvent.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "Hacked Event" },
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).message.includes("Unauthorized to update the event")).toBe(
      true,
    );
  });

  it("should prevent public users from deleting events", async () => {
    const { token } = await registerAndLogin(context.fastify, context.prisma, UserRole.ATTENDEE);

    const response = await context.fastify.inject({
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
      url: `/api/events/${testEvent.id}`,
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).message.includes("Unauthorized to delete the event")).toBe(
      true,
    );
  });
});
