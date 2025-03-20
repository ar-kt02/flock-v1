import { Calendar, Clock, MapPin, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import useDropdownPosition from "@/hooks/useDropdownPosition";
import Event from "@/types/event";
import { formatTime, getDuration, formatDate } from "@/utils/date-utils";
import { downloadICalFile, openGoogleCalendar } from "@/utils/calendar-utils";
import { useClickOutside } from "@/hooks/useClickOutside";

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
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    setIsCalendarDropdownOpen(false);
  });

  const dropdownStyle = useDropdownPosition(
    dropdownRef,
    dropdownContentRef,
    isCalendarDropdownOpen,
  );

  const sidebarStartDateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };

  const sidebarEndDateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
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
            <div className="text-gray-600">
              {formatDate(event.startTime, sidebarStartDateOptions)} -{" "}
              {formatDate(event.endTime, sidebarEndDateOptions)}
            </div>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <Clock size={20} className="text-purple-600 mr-2" />
          <div>
            <div className="font-semibold">Time</div>
            <div className="text-gray-600">
              {formatTime(event.startTime)} - {formatTime(event.endTime)} •{" "}
              {getDuration(event.startTime, event.endTime)}
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

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md text-sm transition flex items-center justify-center"
              >
                <Calendar size={16} className="mr-2" />
                Add to Calendar
                <ChevronDown size={16} className="ml-2" />
              </button>

              {isCalendarDropdownOpen && (
                <div
                  className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                  style={dropdownStyle}
                  ref={dropdownContentRef}
                >
                  <button
                    onClick={() => {
                      downloadICalFile(event);
                      setIsCalendarDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium text-sm transition"
                  >
                    Import to Calendar (.ics)
                  </button>
                  <button
                    onClick={() => {
                      openGoogleCalendar(event);
                      setIsCalendarDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium text-sm transition"
                  >
                    Google Calendar
                  </button>
                </div>
              )}
            </div>
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
