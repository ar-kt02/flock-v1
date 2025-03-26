-- DropForeignKey
ALTER TABLE "EventAttendees" DROP CONSTRAINT "EventAttendees_eventId_fkey";

-- AddForeignKey
ALTER TABLE "EventAttendees" ADD CONSTRAINT "EventAttendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
