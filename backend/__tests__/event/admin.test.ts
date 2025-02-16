import {
   describe,
   beforeAll,
   beforeEach,
   afterEach,
   afterAll,
   it,
   expect,
} from "@jest/globals";
import {
   setupTestEnvironment,
   runPrismaMigrateDev,
   registerAndLogin,
   cleanupTestData,
   createEventAsOrganizer,
   TestContext,
} from "../test-utils";
import { UserRole } from "@prisma/client";
import userRoutes from "../../src/modules/user/user.route";
import eventRoutes from "../../src/modules/event/event.route";

describe("Event Management - Admin", () => {
   let context: TestContext;
   let adminToken: string;
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
      const admin = await registerAndLogin(
         context.fastify,
         context.prisma,
         UserRole.ADMIN
      );
      adminToken = admin.token;

      const organizer = await registerAndLogin(
         context.fastify,
         context.prisma,
         UserRole.ORGANIZER
      );
      organizerToken = organizer.token;

      testEvent = await createEventAsOrganizer(context.fastify, organizerToken);
   });

   afterEach(async () => {
      await cleanupTestData(context.prisma);
   });

   afterAll(async () => {
      await context.prisma.$disconnect();
      await context.fastify.close();
   });

   it("should allow admin to update any event", async () => {
      const response = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${adminToken}` },
         payload: { title: "Admin Updated Event" },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).title).toBe("Admin Updated Event");
   });

   it("should allow admin to delete any event", async () => {
      const response = await context.fastify.inject({
         method: "DELETE",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(response.statusCode).toBe(204);
   });

   it("should allow admin to view full event details", async () => {
      const response = await context.fastify.inject({
         method: "GET",
         url: `/api/events/${testEvent.id}`,
         headers: { authorization: `Bearer ${adminToken}` },
      });

      const event = JSON.parse(response.payload);
      expect(event.attendees).toBeDefined();
      expect(event.organizerId).toBeDefined();
   });

   it("should allow admin to create events on behalf of others", async () => {
      const response = await context.fastify.inject({
         method: "POST",
         url: "/api/events",
         headers: { authorization: `Bearer ${adminToken}` },
         payload: {
            title: "Admin Created Event",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            location: "Admin Location",
            organizerId: (await context.prisma.user.findFirst())?.id,
         },
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.payload).organizerId).toBeTruthy();
   });

   it("should prevent admin from being blocked by organizer permissions", async () => {
      const otherOrganizer = await registerAndLogin(
         context.fastify,
         context.prisma,
         UserRole.ORGANIZER
      );
      const otherEvent = await createEventAsOrganizer(
         context.fastify,
         otherOrganizer.token
      );

      const updateResponse = await context.fastify.inject({
         method: "PUT",
         url: `/api/events/${otherEvent.id}`,
         headers: { authorization: `Bearer ${adminToken}` },
         payload: { title: "Admin Override" },
      });

      const deleteResponse = await context.fastify.inject({
         method: "DELETE",
         url: `/api/events/${otherEvent.id}`,
         headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(deleteResponse.statusCode).toBe(204);
   });

   it("should handle admin operations on non-existent events", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const responses = await Promise.all([
         context.fastify.inject({
            method: "GET",
            url: `/api/events/${fakeId}`,
            headers: { authorization: `Bearer ${adminToken}` },
         }),
         context.fastify.inject({
            method: "PUT",
            url: `/api/events/${fakeId}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { title: "Ghost Event" },
         }),
         context.fastify.inject({
            method: "DELETE",
            url: `/api/events/${fakeId}`,
            headers: { authorization: `Bearer ${adminToken}` },
         }),
      ]);

      expect(responses[0].statusCode).toBe(404);
      expect(responses[1].statusCode).toBe(404);
      expect(responses[2].statusCode).toBe(404);
   });
});
