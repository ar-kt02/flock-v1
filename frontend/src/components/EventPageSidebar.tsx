import { Calendar, Clock, MapPin } from "lucide-react";
import Event from "@/types/event";
import ical from "ical-generator";

interface EventPageSidebarProps {
  event?: Event;
  isSignedUp: boolean;
  onSignup: () => Promise<void>;
  onUnsign: () => Promise<void>;
  isLoading?: boolean;
}

const EventPageSidebar = ({
  event,
  isSignedUp,
  onSignup,
  onUnsign,
  isLoading = false,
}: EventPageSidebarProps) => {
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

  const getDuration = () => {
    if (!event?.startTime || !event?.endTime) return "Duration not specified";
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours < 24) {
      const roundedHours = Math.round(durationHours);
      return roundedHours === 1 ? "1 hour" : `${roundedHours} hours`;
    } else {
      const durationDays = Math.round(durationHours / 24);
      return durationDays === 1 ? "1 day" : `${durationDays} days`;
    }
  };

  const addToCalendar = () => {
    if (!event) return;

    const calendar = ical({
      name: event.title,
      timezone: "Europe/London",
    });

    calendar.createEvent({
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      summary: event.title,
      description: event.description,
      location: event.location,
      url: window.location.href,
    });

    const blob = new Blob([calendar.toString()], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event?.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="md:sticky md:top-6 md:p-4 bg-white md:border md:rounded-xl md:shadow-lg">
        <div className="mb-4">
          <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
            <div>
              <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="md:sticky md:top-6 md:p-4 bg-white md:border md:rounded-xl md:shadow-lg">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-semibold text-gray-900">Join this experience</span>
        </div>
        {event.maxAttendees && (
          <p className="text-gray-600 text-sm">
            Limited to {event.maxAttendees} {event.maxAttendees === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <Calendar size={20} className="text-purple-600 mr-2" />
          <div>
            <div className="font-semibold">Date</div>
            <div className="text-gray-600">{formatDate(event.startTime)}</div>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <Clock size={20} className="text-purple-600 mr-2" />
          <div>
            <div className="font-semibold">Time</div>
            <div className="text-gray-600">
              {formatTime(event.startTime)} - {formatTime(event.endTime)} • {getDuration()}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <MapPin size={20} className="text-purple-600 mr-2" />
          <div>
            <div className="font-semibold">Location</div>
            <div className="text-gray-600">{event.location}</div>
          </div>
        </div>
      </div>

      {isSignedUp ? (
        <div>
          <button
            onClick={onUnsign}
            className="w-full py-3 px-4 border border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition"
          >
            Cancel Reservation
          </button>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <p className="text-green-700 text-sm mb-2">
              {`You're signed up for this experience! We can't wait to see you there.`}
            </p>
            <button
              onClick={addToCalendar}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm transition"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onSignup}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          Reserve a spot
        </button>
      )}
    </div>
  );
};

export default EventPageSidebar;
