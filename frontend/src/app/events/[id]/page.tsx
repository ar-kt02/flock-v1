"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById, signupEvent, unsignEvent, getMyEvents } from "@/lib/api";
import { getAuthCookie } from "@/lib/auth";
import { Calendar, Clock, MapPin } from "lucide-react";
import Event from "@/types/event";
import EventPageSidebar from "@/components/events/EventPageSidebar";
import Image from "next/image";

export default function EventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const { id } = useParams();
  const router = useRouter();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || Array.isArray(id)) return;

      setLoading(true);
      setError(null);
      try {
        const eventData = await getEventById(id);
        setEvent(eventData);
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch event";
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        } else {
          errorMessage = "An unexpected error occurred";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchSignupStatus = async () => {
      if (!id || Array.isArray(id)) return;
      try {
        const token = getAuthCookie();
        if (!token) {
          return;
        }
        const myEvents = await getMyEvents(token);
        const signedUp = myEvents.some((myEvent) => myEvent.id === id);
        setIsSignedUp(signedUp);
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch signup status";
        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
        }
        setError(errorMessage);
      }
    };

    fetchEvent();
    fetchSignupStatus();
  }, [id]);

  const handleSignup = async () => {
    if (!id || Array.isArray(id)) return;

    const token = await getAuthCookie();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await signupEvent(id, token);
      setIsSignedUp(true);
    } catch (error: unknown) {
      let errorMessage = "Failed to sign up for event";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  const handleUnsign = async () => {
    if (!id || Array.isArray(id)) return;

    const token = await getAuthCookie();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await unsignEvent(id, token);
      setIsSignedUp(false);
    } catch (error: unknown) {
      let errorMessage = "Failed to unsign from event";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not specified";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "Time not specified";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-96 w-full">
        {loading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        ) : (
          <Image
            src={event?.imageUrl || "/placeholder.png"}
            alt={event?.title || "Event title"}
            width={500}
            height={300}
            className="w-full h-full object-cover"
            priority={true}
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {loading ? (
              <>
                <div className="border-b pb-4 mb-4">
                  <div className="w-3/4 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                    <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="w-28 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                <div className="border-b pb-4 mb-3">
                  <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                        <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="ml-7 w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                        <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="ml-7 w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4 md:border-b-0 md:pb-0 md:mb-0">
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </>
            ) : (
              event && (
                <>
                  <div className="border-b pb-4 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={18} className="mr-1" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="border-b pb-4 mb-4">
                    <h2 className="text-xl font-semibold mb-3">About this experience</h2>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>

                  {event.category && (
                    <div className="border-b pb-4 mb-4">
                      <h2 className="text-xl font-semibold mb-3">Category</h2>
                      <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        {event.category}
                      </div>
                    </div>
                  )}

                  <div className="border-b pb-4 mb-3">
                    <h2 className="text-xl font-semibold mb-3">When and where</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Calendar size={20} className="text-purple-600 mr-2" />
                          <span className="font-medium">Date</span>
                        </div>
                        <p className="ml-7 text-gray-700">{formatDate(event.startTime)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock size={20} className="text-purple-600 mr-2" />
                          <span className="font-medium">Time</span>
                        </div>
                        <p className="ml-7 text-gray-700">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {event.attendees && (
                    <div className="border-b pb-4 md:border-b-0 md:pb-0 md:mb-0">
                      <h2 className="text-xl font-semibold mb-3">Attendees</h2>
                      <p className="text-gray-700">
                        {event.attendees.length}{" "}
                        {event.attendees.length === 1 ? "person" : "people"} attending
                        {event.maxAttendees && ` (max: ${event.maxAttendees})`}
                      </p>
                    </div>
                  )}
                </>
              )
            )}
          </div>

          <div className="md:col-span-1">
            <EventPageSidebar
              event={event || undefined}
              isSignedUp={isSignedUp}
              onSignup={handleSignup}
              onUnsign={handleUnsign}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
