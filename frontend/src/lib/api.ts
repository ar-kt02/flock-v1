import Event from "@/types/event";
import { getAuthCookie } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  return data.token;
}

export async function register(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | undefined> {
  const response = await fetch(`${BACKEND_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  const data = await response.json();
  return data;
}

export async function logoutUser(token: string): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      let errorMessage = "Logout failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `${errorMessage} (Status ${response.status})`;
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error: failed to reach server";
    throw new Error(`Logout failed: ${message}`);
  }
}

export async function getUserRole(token: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/users/protected`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.role;
}

export async function signupEvent(eventId: string, token: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/signup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to sign up for event");
  }
}

export async function unsignEvent(eventId: string, token: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/signup`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to unsign up for event");
  }
}

export async function getMyEvents(token: string): Promise<Event[]> {
  const response = await fetch(`${BACKEND_URL}/api/events/attending`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch my events");
  }

  const data = await response.json();
  return data;
}

export async function getAllEvents(
  page: number = 1,
  limit: number = 10,
  isExpired: boolean = false,
): Promise<{ events: Event[]; total: number }> {
  const timestamp = new Date().getTime();
  const url = `${BACKEND_URL}/api/events?page=${page}&limit=${limit}&_t=${timestamp}&isExpired=${isExpired}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
  }

  const totalCountHeader = response.headers.get("X-Total-Count");
  const total = totalCountHeader ? Number(totalCountHeader) : 0;

  const events: Event[] = await response.json();
  return { events, total };
}

export async function getEventById(id: string): Promise<Event> {
  const token = getAuthCookie();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}/api/events/${id}`, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch event");
  }

  const data = await response.json();
  return data;
}

export async function getEventsByOrganizer(token: string): Promise<Event[]> {
  const response = await fetch(`${BACKEND_URL}/api/events/organizer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch organizer events");
  }

  const data = await response.json();
  return data;
}

export async function updateEvent(
  eventId: string,
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  location: string,
  imageUrl: string,
  maxAttendees: string,
  category: string,
  token: string,
): Promise<Event> {
  const response = await fetch(`${BACKEND_URL}/api/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      startTime,
      endTime,
      location,
      imageUrl,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      category,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update event");
  }

  const data = await response.json();
  return data;
}

export async function createEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  location: string,
  imageUrl: string,
  maxAttendees: string,
  category: string,
  token: string,
): Promise<Event> {
  const response = await fetch(`${BACKEND_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title,
      description,
      startTime,
      endTime,
      location,
      imageUrl,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      category,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create event");
  }

  const data = await response.json();
  return data;
}
