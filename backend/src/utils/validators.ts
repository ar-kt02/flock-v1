import validator from "validator";
import { FastifyRequest, FastifyReply } from "fastify";
import { LoginBodySchema } from "../modules/user/schemas/login.schema";
import { Static } from "@fastify/type-provider-typebox";
import { RegisterBodySchema } from "../modules/user/schemas/register.schema";
import { ValidationError } from "./errors";

export const validateLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as Static<typeof LoginBodySchema>;
  if (!body || !body.email) {
    throw new ValidationError("Email is required");
  }

  if (!body.password) {
    throw new ValidationError("Password is required");
  }

  return;
};

export const validatePassword = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minSymbols: 1,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
  });
};

export const validateEmail = (email: string) => {
  return validator.isEmail(email);
};

const validateRegisterEmail = (email: string) => {
  if (email) {
    if (!validateEmail(email)) {
      throw new ValidationError("Enter a valid email");
    }
  } else {
    throw new ValidationError("Email is required");
  }
};

const validateRegisterPassword = (password: string) => {
  if (password) {
    if (!validatePassword(password)) {
      throw new ValidationError(
        "Password must use at least 8 characters with a mix of letters, numbers & symbols",
      );
    }
  } else {
    throw new ValidationError("Password is required");
  }
};

export const validateCredentials = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as Static<typeof RegisterBodySchema>;

  if (body) {
    validateRegisterEmail(body.email);
    validateRegisterPassword(body.password);
  } else {
    throw new ValidationError("Email and password are required");
  }

  return;
};
