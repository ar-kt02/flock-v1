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

describe("Event Management - Organizer", () => {
   let context: TestContext;
   let organizerToken: string;
   let anotherOrganizerToken: string;
   let testEvent: any;

   beforeAll(async () => {
      context = setupTestEnvironment();
      runPrismaMigrateDev();

      await context.fastify.register(userRoutes, { prefix: "/api/users" });
      await context.fastify.register(eventRoutes, { prefix: "/api/events" });
      await context.fastify.ready();
   });

   beforeEach(async () => {
      const organizer = await registerAndLogin(
         context.fastify,
         context.prisma,
         UserRole.ORGANIZER
      );
      organizerToken = organizer.token;

      const anotherOrganizer = await registerAndLogin(
         context.fastify,
         context.prisma,
         UserRole.ORGANIZER
      );
      anotherOrganizerToken = anotherOrganizer.token;

      testEvent = await createEventAsOrganizer(
         context.fastify,
         organizerToken,
         {
            title: "Organizer Test Event",
            description: "Organizer Test Description",
            imageUrl: "http://example.com/organizer-image.jpg",
            maxAttendees: 50,
            category: "Conference",
         }
      );
   });

   afterEach(async () => {
      await cleanupTestData(context.prisma);
   });

   afterAll(async () => {
      await context.prisma.$disconnect();
      await context.fastify.close();
   });

   it("should create a new event with all fields", async () => {
      const response = await context.fastify.inject({
         method: "POST",
         url: "/api/events",
         headers: { authorization: `Bearer ${organizerToken}` },
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

      expect(response.statusCode).toBe(201);
      const event = JSON.parse(response.payload);
      expect(event.title).toBe("New Conference");
      expect(event.maxAttendees).toBe(1000);
      expect(event.organizerId).toBeTruthy();
   });

   it("should update an existing event", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: {
            title: "Updated Conference",
            maxAttendees: 200,
         },
      });

      expect(response.statusCode).toBe(200);
      const updatedEvent = JSON.parse(response.payload);
      expect(updatedEvent.title).toBe("Updated Conference");
      expect(updatedEvent.maxAttendees).toBe(200);
   });

   it("should prevent updating another organizer's event", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${anotherOrganizerToken}` },
         payload: { title: "Unauthorized Update" },
      });

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.payload).message).toBe(
         "Unauthorized to update the event"
      );
   });

   it("should delete an existing event", async () => {
      const deleteResponse = await context.fastify.inject({
         method: "DELETE",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
      });
      expect(deleteResponse.statusCode).toBe(204);

      const getResponse = await context.fastify.inject({
         method: "GET",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
      });

      expect(JSON.parse(getResponse.payload).message).toBe("Event not found");
      expect(getResponse.statusMessage).toBe("Not Found");
      expect(getResponse.statusCode).toBe(404);
   });

   it("should prevent deleting another organizer's event", async () => {
      const response = await context.fastify.inject({
         method: "DELETE",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${anotherOrganizerToken}` },
      });

      expect(response.statusCode).toBe(403);
      expect(response.statusMessage).toBe("Forbidden");
      expect(JSON.parse(response.payload).message).toBe(
         "Unauthorized to delete the event"
      );
   });

   it("should view event with attendee details", async () => {
      const attendee = await registerAndLogin(context.fastify, context.prisma);
      await context.fastify.inject({
         method: "POST",
         url: `/api/events/${testEvent.id}/signup`,
         headers: { authorization: `Bearer ${attendee.token}` },
      });

      const response = await context.fastify.inject({
         method: "GET",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
      });

      const event = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(event.attendees).toHaveLength(1);
      expect(event.attendees[0].user.email).toBe(attendee.email);
   });

   it("should create event with maximum attendees", async () => {
      const response = await context.fastify.inject({
         method: "POST",
         url: "/api/events",
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: {
            title: "Limited Event",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            location: "Small Room",
            maxAttendees: 1,
         },
      });

      expect(response.statusCode).toBe(201);
      const event = JSON.parse(response.payload);
      expect(event.maxAttendees).toBe(1);
   });

   it("should reject invalid date format", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: {
            startTime: "invalid-date",
         },
      });

      expect(response.statusCode).toBe(400);
      const error = JSON.parse(response.payload);
      expect(error.message).toBe("Invalid startTime format");
   });

   it("should reject invalid endTime format", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: {
            endTime: "invalid-date",
         },
      });

      expect(response.statusCode).toBe(400);
      const error = JSON.parse(response.payload);
      expect(error.message).toBe("Invalid endTime format");
   });

   it("should reject negative maxAttendees", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: {
            maxAttendees: -5,
         },
      });

      expect(response.statusCode).toBe(400);
      const error = JSON.parse(response.payload);
      expect(error.message).toBe("maxAttendees must be a non-negative number");
   });

   it("should return 404 when updating non-existent event", async () => {
      const fakeEventId = "00000000-0000-0000-0000-000000000000";
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${fakeEventId}`,
         headers: { authorization: `Bearer ${organizerToken}` },
         payload: { title: "Non-existent Event" },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload).message).toBe("Event not found");
   });
});
