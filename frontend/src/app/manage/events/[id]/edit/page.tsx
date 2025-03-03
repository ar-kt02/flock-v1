"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEventById, updateEvent } from "@/lib/api";
import { getAuthCookie } from "@/lib/auth";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";

export default function EditEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [minDate, setMinDate] = useState("");
  const router = useRouter();
  const { id } = useParams();
  const { userRole } = useUserRole();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [originalValues, setOriginalValues] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    imageUrl: "",
    maxAttendees: "",
    category: "",
  });

  useEffect(() => {
    if (userRole !== null) {
      setHasPermission(userRole === "ORGANIZER" || userRole === "ADMIN");
    }
  }, [userRole]);

  useEffect(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    setMinDate(today.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const changed =
        title !== originalValues.title ||
        description !== originalValues.description ||
        startTime !== originalValues.startTime ||
        endTime !== originalValues.endTime ||
        location !== originalValues.location ||
        imageUrl !== originalValues.imageUrl ||
        maxAttendees !== originalValues.maxAttendees ||
        category !== originalValues.category;

      setHasChanges(changed);
    }
  }, [
    title,
    description,
    startTime,
    endTime,
    location,
    imageUrl,
    maxAttendees,
    category,
    originalValues,
    isInitialized,
  ]);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const event = await getEventById(id as string);

        const formattedStartTime = new Date(event.startTime).toISOString().slice(0, 16);
        const formattedEndTime = new Date(event.endTime).toISOString().slice(0, 16);

        const maxAttendeesStr = event.maxAttendees ? event.maxAttendees.toString() : "";

        setTitle(event.title || "");
        setDescription(event.description || "");
        setStartTime(formattedStartTime);
        setEndTime(formattedEndTime);
        setLocation(event.location || "");
        setImageUrl(event.imageUrl || "");
        setMaxAttendees(maxAttendeesStr);
        setCategory(event.category || "");

        setOriginalValues({
          title: event.title || "",
          description: event.description || "",
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          location: event.location || "",
          imageUrl: event.imageUrl || "",
          maxAttendees: maxAttendeesStr,
          category: event.category || "",
        });

        setIsInitialized(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message || "Failed to fetch event");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const validateDateRange = (start: string, end: string): boolean => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return startDate < endDate;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (hasPermission === null) {
      return;
    }

    if (!hasPermission) {
      setError("You don't have permission to edit events");
      return;
    }

    if (!validateDateRange(startTime, endTime)) {
      setError("End time must be after start time");
      return;
    }

    setIsLoading(true);
    setSuccess(false);

    try {
      const token = await getAuthCookie();
      if (!token) {
        router.push("/login");
        return;
      }

      await updateEvent(
        id as string,
        title,
        description,
        startTime,
        endTime,
        location,
        imageUrl,
        maxAttendees,
        category,
        token,
      );

      setSuccess(true);

      setOriginalValues({
        title,
        description,
        startTime,
        endTime,
        location,
        imageUrl,
        maxAttendees,
        category,
      });

      setHasChanges(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Failed to update event");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <div className="bg-white shadow-lg rounded-lg px-6 py-8 w-full max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-6">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
        <div className="bg-white shadow-lg rounded-lg px-6 py-8 w-full max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Permission Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page. Only organizers and administrators can
            edit events.
          </p>
          <Link
            href="/events"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="bg-white shadow-lg rounded-lg px-6 py-8 w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-6">Edit Event</h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-green-700 mb-3 sm:mb-0">Changes applied successfully!</p>
              <Link
                href={`/events/${id}`}
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                View Event
              </Link>
            </div>
          </div>
        )}

        {isLoading && !error && !success ? (
          <div className="flex justify-center my-8">
            <div className="animate-pulse text-purple-600">Loading event data...</div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-full">
                <label className="block text-gray-700 font-medium" htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="title"
                  type="text"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 col-span-full">
                <label className="block text-gray-700 font-medium" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors min-h-32 text-gray-700"
                  id="description"
                  placeholder="Describe your event"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="startTime">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={minDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="endTime">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || minDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="location"
                  type="text"
                  placeholder="Event location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="category">
                  Category
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="category"
                  type="text"
                  placeholder="Event category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="maxAttendees">
                  Max Attendees
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="maxAttendees"
                  type="number"
                  placeholder="Maximum number of attendees"
                  value={maxAttendees}
                  onChange={(e) => setMaxAttendees(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-700"
                  id="imageUrl"
                  type="text"
                  placeholder="URL for event image"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Event"}
              </button>
            </div>

            {!hasChanges && !isLoading && !success && isInitialized && (
              <p className="text-center text-sm text-gray-500 mt-2">No changes to save</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
