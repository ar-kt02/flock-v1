import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export class CustomError extends Error {
  statusCode: number;
  name: string;

  constructor(message: string, statusCode: number, name?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || "Error";
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
    if (error.code === "P2002") {
      reply.status(400).send({
        statusCode: 400,
        error: "UniqueConstraint",
        message: "Invalid request",
      });
      return;
    }
    reply.status(400).send({
      statusCode: 400,
      error: "InvalidRequestError",
      message: "Invalid request",
    });
    return;
  }

  reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Something went wrong",
  });
}
