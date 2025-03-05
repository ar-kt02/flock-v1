"use client";

import { getEventsByOrganizer, getAllEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import Event from "@/types/event";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { getAuthCookie } from "@/lib/auth";
import { Search, Plus } from "lucide-react";

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { userRole } = useUserRole();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthCookie();
      setIsAuthenticated(!!token);
      return !!token;
    };

    const tokenExists = checkAuth();
    if (!tokenExists) {
      router.push("/login");
      return;
    }

    if (userRole !== null && tokenExists) {
      setHasPermission(userRole === "ORGANIZER" || userRole === "ADMIN");
    }
  }, [router, userRole]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthCookie();
        if (!token) {
          setError("Not authenticated.");
          return;
        }

        let eventsData: Event[];
        if (userRole === "ADMIN") {
          const { events: fetchedEvents } = await getAllEvents(1, 100);
          eventsData = fetchedEvents;
        } else if (userRole === "ORGANIZER") {
          eventsData = await getEventsByOrganizer(token);
        } else {
          setError("You do not have permission to view this page.");
          return;
        }
        const filteredEvents = eventsData.filter((event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setEvents(filteredEvents);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Failed to fetch events");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission && isAuthenticated) {
      fetchEvents();
    }
  }, [router, userRole, searchQuery, hasPermission, isAuthenticated]);

  const handleCreateEvent = () => {
    router.push("/manage/create");
  };

  const renderLoadingState = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <EventCard key={`skeleton-${index}`} isLoading={true} />
    ));
  };

  if (hasPermission === null || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <p className="text-gray-600">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Permission Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page. Only organizers and administrators can
            manage events.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="bg-gradient-purple-normal text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Manage Events</h1>
            <button
              onClick={handleCreateEvent}
              className="bg-white text-purple-700 font-medium px-6 py-3 rounded-full shadow-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-200 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Create Event
            </button>
          </div>
          <p className="text-xl mb-8 text-purple-100">Manage your events here</p>
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search experiences..."
              className="w-full py-4 px-6 pr-12 rounded-full text-purple-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-500">
              <Search size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {!error && (
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading
                ? renderLoadingState()
                : events.map((event) => <EventCard key={event.id} event={event} />)}

              {!loading && events.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No events found. Try adjusting your search or create a new event.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
