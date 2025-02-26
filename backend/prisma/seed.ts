import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const saltRounds = 12;

async function main() {
  const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./seed-data/users.json"), "utf-8"),
  );
  const eventsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./seed-data/events.json"), "utf-8"),
  );

  await prisma.eventAttendees.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  let adminUser;
  const organizerUsers = [];

  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role as "ADMIN" | "ORGANIZER" | "ATTENDEE",
      },
    });
    if (userData.role === "ADMIN") {
      adminUser = user;
    } else if (userData.role === "ORGANIZER") {
      organizerUsers.push(user);
    }
  }

  if (organizerUsers.length === 0) {
    throw new Error(
      "No organizer users were created during seeding. Check users.json data for ORGANIZER roles.",
    );
  }

  const attendees = await prisma.user.findMany({
    where: {
      role: "ATTENDEE",
    },
  });

  const events = [];
  for (const eventData of eventsData) {
    const randomOrganizer = organizerUsers[Math.floor(Math.random() * organizerUsers.length)];

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        maxAttendees: eventData.maxAttendees,
        category: eventData.category,
        organizerId: randomOrganizer.id,
        imageUrl: eventData.imageUrl,
      },
    });
    events.push(event);
  }

  const numberOfAttendeesPerEvent = 4;
  const shuffledAttendees = [...attendees].sort(() => 0.5 - Math.random());

  for (const event of events) {
    const attendeesForEvent = shuffledAttendees.slice(0, numberOfAttendeesPerEvent);
    await prisma.eventAttendees.createMany({
      data: attendeesForEvent.map((attendee) => ({
        eventId: event.id,
        userId: attendee.id,
      })),
      skipDuplicates: true,
    });
    shuffledAttendees.splice(0, numberOfAttendeesPerEvent); // Remove assigned attendees ,optional/prevent reuse
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
