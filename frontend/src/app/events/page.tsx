"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/EventCard";
import Event from "@/types/event";
import { Search, Filter } from "lucide-react";
import { getAllEvents } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 8;

  const filterOptions = ["All", "Today", "Online", "In Person"];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { events: fetchedEvents, total } = await getAllEvents(
          currentPage,
          eventsPerPage,
          false,
        );

        setTotalPages(Math.max(1, Math.ceil(total / eventsPerPage)));
        setTotalEvents(total);

        const filtered = fetchedEvents.filter((event: Event) => {
          const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());

          if (!matchesSearch) return false;

          switch (activeFilter) {
            case "All":
              return true;
            case "Today":
              return isToday(event.startTime);
            case "Online":
              return (
                event.location?.toLowerCase().includes("online") ||
                event.location?.toLowerCase().includes("virtual") ||
                event.isVirtual === true
              );
            case "In Person":
              return (
                !event.location?.toLowerCase().includes("online") &&
                !event.location?.toLowerCase().includes("virtual") &&
                event.isVirtual !== true
              );
            default:
              return true;
          }
        });

        setEvents(filtered);
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch events";
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

    fetchEvents();
  }, [currentPage, eventsPerPage, searchQuery, activeFilter]);

  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="bg-gradient-purple-normal text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Discover Experiences</h1>
          <p className="text-xl mb-8 text-purple-100">Find unique activities today</p>

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
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          {filterOptions.map((option) => (
            <button
              key={option}
              className={`px-6 py-2 rounded-full whitespace-nowrap ${
                activeFilter === option
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-800 border border-purple-200 hover:bg-purple-100"
              }`}
              onClick={() => {
                setActiveFilter(option);
                setCurrentPage(1);
              }}
            >
              {option}
            </button>
          ))}
          <button className="px-6 py-2 rounded-full bg-white text-purple-800 border border-purple-200 flex items-center gap-2 whitespace-nowrap hover:bg-purple-100">
            <Filter size={16} />
            More filters
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <h2 className="text-2xl font-semibold text-purple-900 mb-6">
              {totalEvents} experience{totalEvents !== 1 ? "s" : ""} to explore
              {activeFilter !== "All" && <span className="text-purple-600"> • {activeFilter}</span>}
            </h2>

            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>

            {events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-purple-700 mb-4">No experiences found</p>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : activeFilter !== "All"
                      ? `No ${activeFilter.toLowerCase()} events available`
                      : "Try adjusting your filters"}
                </p>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 px-4 py-2 rounded-l-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-purple-700 px-4 py-2 flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 px-4 py-2 rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
