import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof CustomError) {
    reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    reply.status(400).send({
      statusCode: 400,
      error: "Database Error",
      message: error.message,
    });
    return;
  }

  reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Something went wrong",
  });
}
