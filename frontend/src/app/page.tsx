"use client";

import { useState, useEffect, useRef } from "react";
import { getAllEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import Event from "@/types/event";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [eventsByCategory, setEventsByCategory] = useState<Record<string, Event[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const scrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [scrollState, setScrollState] = useState<Record<string, { left: boolean; right: boolean }>>(
    {},
  );

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { events: eventsData } = await getAllEvents(1, 100);

        const groupedEvents: Record<string, Event[]> = {};
        eventsData.forEach((event) => {
          const category = event.category || "Uncategorized";
          if (!groupedEvents[category]) {
            groupedEvents[category] = [];
          }
          groupedEvents[category].push(event);
        });

        const sortedCategories = Object.keys(groupedEvents).sort(
          (a, b) => groupedEvents[b].length - groupedEvents[a].length,
        );

        const initialScrollState: Record<string, { left: boolean; right: boolean }> = {};
        sortedCategories.forEach((category) => {
          initialScrollState[category] = { left: false, right: true };
        });

        setActiveCategories(sortedCategories);
        setEventsByCategory(groupedEvents);
        setScrollState(initialScrollState);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to fetch events");
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const checkScrollForCategory = (category: string) => {
      const element = scrollerRefs.current[category];
      if (!element) return;

      const canScrollLeft = element.scrollLeft > 0;
      const hasMoreToScroll = element.scrollWidth > element.clientWidth + element.scrollLeft + 2;

      setScrollState((prev) => ({
        ...prev,
        [category]: { left: canScrollLeft, right: hasMoreToScroll },
      }));
    };

    const handleResize = () => {
      activeCategories.forEach((category) => checkScrollForCategory(category));
    };

    window.addEventListener("resize", handleResize);

    const scrollHandlers: Record<string, () => void> = {};

    const currentRefs = { ...scrollerRefs.current };

    activeCategories.forEach((category) => {
      const element = currentRefs[category];
      if (element) {
        const handler = () => checkScrollForCategory(category);
        scrollHandlers[category] = handler;
        element.addEventListener("scroll", handler);
        setTimeout(() => checkScrollForCategory(category), 100);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);

      activeCategories.forEach((category) => {
        const element = currentRefs[category];
        if (element && scrollHandlers[category]) {
          element.removeEventListener("scroll", scrollHandlers[category]);
        }
      });
    };
  }, [activeCategories, eventsByCategory]);

  const scrollCategory = (category: string, direction: "left" | "right") => {
    const element = scrollerRefs.current[category];
    if (!element) return;

    const cardWidth = 280;
    const gap = 24;
    const scrollAmount = direction === "left" ? -(cardWidth + gap) : cardWidth + gap;

    element.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      Music:
        "Discover amazing concerts and musical performances from your favorite artists and upcoming talents.",
      Sports:
        "Stay active with sports events ranging from amateur competitions to professional tournaments.",
      Technology:
        "Explore the latest technological innovations and join networking events with industry leaders.",
      Arts: "Immerse yourself in the creative world of art exhibitions, theater performances, and cultural showcases.",
      Food: "Indulge in culinary experiences, food festivals, and cooking workshops with talented chefs.",
      Business:
        "Connect with professionals and entrepreneurs at conferences, workshops, and networking events.",
      Education:
        "Expand your knowledge with lectures, workshops, and educational seminars on various topics.",
      Community:
        "Join community gatherings, volunteer opportunities, and local initiatives to make a difference.",
      Uncategorized:
        "Explore a variety of unique events that don't fit into traditional categories.",
    };

    return (
      descriptions[category] ||
      `Explore a collection of interesting ${category.toLowerCase()} events happening around you.`
    );
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <div className="bg-gradient-purple-normal text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Your Next Experience</h1>
          <p className="text-xl mb-8 text-purple-100">
            Find unique activities that match your interests
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && activeCategories.length === 0 && (
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">No events available. Check back soon!</p>
        </div>
      )}

      {!loading &&
        !error &&
        activeCategories.map((category) => (
          <section key={category} className="py-8">
            <div className="container mx-auto px-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{category}</h2>
                    <p className="text-gray-600 mt-2">{getCategoryDescription(category)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`rounded-full p-2 border ${
                        scrollState[category]?.left
                          ? "text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
                          : "text-gray-300 border-gray-200 cursor-not-allowed"
                      }`}
                      onClick={() => scrollCategory(category, "left")}
                      disabled={!scrollState[category]?.left}
                      aria-label="Previous item"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className={`rounded-full p-2 border ${
                        scrollState[category]?.right
                          ? "text-purple-600 border-purple-200 hover:bg-purple-50 cursor-pointer"
                          : "text-gray-300 border-gray-200 cursor-not-allowed"
                      }`}
                      onClick={() => scrollCategory(category, "right")}
                      disabled={!scrollState[category]?.right}
                      aria-label="Next item"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <a
                      href={`/events?category=${encodeURIComponent(category)}`}
                      className="text-purple-600 hover:underline font-medium"
                    >
                      View All
                    </a>
                  </div>
                </div>

                <div
                  ref={(el) => {
                    scrollerRefs.current[category] = el;
                  }}
                  className="overflow-x-auto flex space-x-6 py-0 md:py-6 lg:py-6 hide-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {eventsByCategory[category]?.length > 0 ? (
                    eventsByCategory[category].map((event) => (
                      <div
                        key={event.id}
                        className="flex-shrink-0 w-[220px] md:w-[280px] lg:w-[280px]"
                      >
                        <EventCard event={event} />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 py-8">No events in this category yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
    </div>
  );
}
