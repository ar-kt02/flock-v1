import { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../utils/errors";

export const getProfileByUserId = async (prisma: PrismaClient, userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: userId },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  return profile;
};

export const createProfile = async (
  prisma: PrismaClient,
  userId: string,
  profileData: {
    email: string;
    firstName?: string;
    surname?: string;
    phoneNumber?: string;
    location?: string;
    interests?: string[];
  },
) => {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new BadRequestError("Profile already exists for user");
  }

  const profile = await prisma.profile.create({
    data: {
      userId,
      email: profileData.email,
      firstName: profileData.firstName,
      surname: profileData.surname,
      phoneNumber: profileData.phoneNumber,
      location: profileData.location,
      interests: profileData.interests,
    },
  });

  return profile;
};
