import {
  setupTestEnvironment,
  runPrismaMigrateDev,
  registerAndLogin,
  cleanupTestData,
  createEventAsOrganizer,
  TestContext,
} from "../test-utils";
import userRoutes from "../../src/modules/user/user.route";
import eventRoutes from "../../src/modules/event/event.route";
import { UserRole } from "@prisma/client";

describe("Event Management - Attendee", () => {
  let context: TestContext;
  let attendeeToken: string;
  let organizerToken: string;
  let testEvent: any;

  beforeAll(async () => {
    context = setupTestEnvironment();
    runPrismaMigrateDev();

    await context.fastify.register(userRoutes, { prefix: "/api/users" });
    await context.fastify.register(eventRoutes, { prefix: "/api/events" });
    await context.fastify.ready();
  });

  beforeEach(async () => {
    const attendee = await registerAndLogin(context.fastify, context.prisma);
    const organizer = await registerAndLogin(context.fastify, context.prisma, UserRole.ORGANIZER);

    attendeeToken = attendee.token;
    organizerToken = organizer.token;

    testEvent = await createEventAsOrganizer(context.fastify, organizerToken, {
      title: "Test Event",
      description: "Test Description",
      imageUrl: "http://example.com/image.jpg",
      maxAttendees: 100,
      category: "Concert",
    });
  });

  afterEach(async () => {
    await cleanupTestData(context.prisma);
  });

  afterAll(async () => {
    await context.prisma.$disconnect();
    await context.fastify.close();
  });

  it("should prevent attendee from creating events", async () => {
    const response = await context.fastify.inject({
      method: "POST",
      url: "/api/events",
      headers: { authorization: `Bearer ${attendeeToken}` },
      payload: {
        title: "Illegal Event",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: "Test Location",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).message).toBe("Insufficient permissions");
  });

  it("should get event details with public fields", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: `/api/events/${testEvent.id}`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    const event = JSON.parse(response.payload);
    expect(response.statusCode).toBe(200);
    expect(event.title).toBe("Test Event");
    expect(event.description).toBe("Test Description");
    expect(event.imageUrl).toBe("http://example.com/image.jpg");
    expect(event.maxAttendees).toBe(100);
    expect(event.category).toBe("Concert");
    expect(event.attendees).toBeUndefined();
  });

  it("should prevent attendee from updating events", async () => {
    const response = await context.fastify.inject({
      method: "PUT",
      url: `/api/events/${testEvent.id}`,
      headers: { authorization: `Bearer ${attendeeToken}` },
      payload: { title: "Updated Title" },
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).message).toBe("Unauthorized to update the event");
  });

  it("should allow attendee to sign up for event", async () => {
    const response = await context.fastify.inject({
      method: "POST",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).message).toBe("Successfully signed up for the event");
  });

  it("should prevent duplicate signups", async () => {
    await context.fastify.inject({
      method: "POST",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    const response = await context.fastify.inject({
      method: "POST",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.payload).message).toBe("Already signed up");
  });

  it("should allow attendee to unsign from event", async () => {
    await context.fastify.inject({
      method: "POST",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    const response = await context.fastify.inject({
      method: "DELETE",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload).message).toBe("Successfully unsigned up for the event");
  });

  it("should prevent signing up when event is full", async () => {
    const limitedEvent = await createEventAsOrganizer(context.fastify, organizerToken, {
      maxAttendees: 1,
    });

    await context.fastify.inject({
      method: "POST",
      url: `/api/events/${limitedEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    const anotherAttendee = await registerAndLogin(context.fastify, context.prisma);
    const response = await context.fastify.inject({
      method: "POST",
      url: `/api/events/${limitedEvent.id}/signup`,
      headers: { authorization: `Bearer ${anotherAttendee.token}` },
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.payload).message).toBe("Event is full");
  });

  it("should prevent updating another organizer's event", async () => {
    const anotherAttendee = await registerAndLogin(context.fastify, context.prisma);

    const response = await context.fastify.inject({
      method: "PUT",
      url: `/api/events/${testEvent.id}`,
      headers: { authorization: `Bearer ${anotherAttendee.token}` },
      payload: { title: "Unauthorized Update" },
    });

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.payload).message).toBe("Unauthorized to update the event");
  });

  it("should handle unsigning from non-signed event", async () => {
    const response = await context.fastify.inject({
      method: "DELETE",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.payload).message).toBe("Not sign up");
  });

  it("should display associated user's signed up events", async () => {
    await context.fastify.inject({
      method: "POST",
      url: `/api/events/${testEvent.id}/signup`,
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    const response = await context.fastify.inject({
      method: "GET",
      url: "/api/events/attending",
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(200);
    const events = JSON.parse(response.payload);
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);

    const foundEvent = events.find((event: any) => event.id === testEvent.id);
    expect(foundEvent.title).toBe("Test Event");
  });

  it("should return an empty array if the user has not signed up for any events", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: "/api/events/attending",
      headers: { authorization: `Bearer ${attendeeToken}` },
    });

    expect(response.statusCode).toBe(200);
    const events = JSON.parse(response.payload);
    expect(events.length).toBe(0);
  });

  it("should return 401 Unauthorized when no token is provided", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: "/api/events/attending",
    });

    expect(response.statusCode).toBe(401);
    const payload = JSON.parse(response.payload);

    expect(payload.message).toBe("Authentication required.");
  });

  it("should return 401 Unauthorized when an invalid token is provided", async () => {
    const response = await context.fastify.inject({
      method: "GET",
      url: "/api/events/attending",
      headers: { authorization: `Bearer invalid_token` },
    });

    expect(response.statusCode).toBe(401);
    const payload = JSON.parse(response.payload);
    expect(payload.message).toBe("Authentication required.");
  });
});
