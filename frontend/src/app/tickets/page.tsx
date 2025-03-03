"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/lib/auth";
import { getMyEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import Event from "@/types/event";

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const token = await getAuthCookie();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const eventsData = await getMyEvents(token);
        setEvents(eventsData);
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

    fetchEvents();
  }, [router]);

  const renderSkeletonCards = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <EventCard key={`skeleton-${index}`} isLoading={true} />
    ));
  };

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="bg-gradient-purple-normal text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Tickets</h1>
          <p className="text-xl mb-8 text-purple-100">{`Events you've signed up to attend`}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {!error && (
          <>
            {!loading && (
              <h2 className="text-2xl font-semibold text-purple-900 mb-6">
                {events.length} upcoming event{events.length !== 1 ? "s" : ""} {`you're attending`}
              </h2>
            )}

            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading
                  ? renderSkeletonCards()
                  : events.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
            </div>

            {!loading && events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-purple-700 mb-4">
                  {`You haven't registered for any events yet`}
                </p>
                <p className="text-gray-600 mb-6">
                  {`Explore available events to find experiences you'd like to join`}
                </p>
                <button
                  onClick={() => router.push("/events")}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-full transition-colors"
                >
                  Discover Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
