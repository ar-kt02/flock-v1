import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
   id: string;
   role: UserRole;
}

export interface EventWithOrganizer {
   organizerId: string;
}

export function authorizeEventModification(
   user: AuthenticatedUser,
   event: EventWithOrganizer
): boolean {
   return user.role === UserRole.ADMIN || event.organizerId === user.id;
}

export function authorizationErrorMessage(action: string): string {
   return `Unauthorized to ${action} the event`;
}

export function isAdmin(user: AuthenticatedUser): boolean {
   return user.role === UserRole.ADMIN;
}
