import Cookies from "js-cookie";

const isProduction = process.env.NODE_ENV === "production";

export function getAuthCookie() {
  return Cookies.get("authToken");
}

export function setAuthCookie(token: string) {
  Cookies.set("authToken", token, {
    expires: 7,
    secure: isProduction,
    sameSite: "strict",
  });
}

export function deleteAuthCookie() {
  Cookies.remove("authToken");
}

import { getUserRole as apiGetUserRole } from "@/lib/api";

export async function getUserRole(token: string | undefined): Promise<string | undefined> {
  if (!token) return undefined;
  try {
    const role = await apiGetUserRole(token);
    return role;
  } catch (error: unknown) {
    let errorMessage = "Failed to get user role";
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
}

export async function isOrganizer(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const role = await getUserRole(token);
    return role === "ORGANIZER" || role === "ADMIN";
  } catch (error: unknown) {
    let errorMessage = "Failed to determine organizer status";
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
}
