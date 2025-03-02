import { UserRole } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const saltRounds = 12;

export const createUser = async (
  prisma: PrismaClient,
  email: string,
  password: string,
  role: UserRole = UserRole.ATTENDEE,
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role,
      },
    });

    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("Email already exists");
    }
    throw new Error("Failed to create user");
  }
};

export const findUserByEmail = async (prisma: PrismaClient, email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    return user;
  } catch (error) {
    throw new Error("Failed to find user");
  }
};

export const comparePassword = async (password: string, hashed: string) => {
  try {
    return await bcrypt.compare(password, hashed);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};
