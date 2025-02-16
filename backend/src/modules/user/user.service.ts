import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 12;

export const createUser = async (
   email: string,
   password: string,
   role: UserRole = UserRole.ATTENDEE
) => {
   try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.create({
         data: {
            email: email,
            password: hashedPassword,
            role: role,
         },
      });

      return user;
   } catch (error) {
      throw new Error("Sign up failed.");
   }
};

export const findUserByEmail = async (email: string) => {
   try {
      const user = await prisma.user.findUnique({
         where: {
            email,
         },
      });

      return user;
   } catch (error) {
      throw new Error("Cannot find user with email.");
   }
};

export const comparePassword = async (password: string, hashed: string) => {
   try {
      return await bcrypt.compare(password, hashed);
   } catch (error) {
      throw new Error("Failed to validate password.");
   }
};
