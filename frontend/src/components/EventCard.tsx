"use client";

import Link from "next/link";
import Event from "@/types/event";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserRole } from "@/context/UserRoleContext";

interface EventCardProps {
  event?: Event;
  isLoading?: boolean;
}

export default function EventCard({ event, isLoading = false }: EventCardProps) {
  const [showEditButton, setShowEditButton] = useState(false);
  const pathname = usePathname();
  const { userRole } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const checkRole = async () => {
      if (userRole) {
        setShowEditButton(
          pathname === "/manage" && (userRole === "ORGANIZER" || userRole === "ADMIN"),
        );
      } else {
        setShowEditButton(false);
      }
    };
    checkRole();
  }, [pathname, userRole, isLoading]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleTimeString("en-GB", options);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden flex flex-col h-full group relative transition-all duration-300">
        <div className="relative h-full flex flex-col">
          <div className="relative h-80 md:h-96 lg:h-96 w-full overflow-hidden rounded-md bg-gray-200 animate-pulse"></div>

          <div className="pt-1 pb-2 flex flex-col flex-grow">
            <div className="flex items-center mb-0.5">
              <div className="w-10 h-2.5 bg-gray-200 rounded animate-pulse mr-2"></div>
              <div className="w-14 h-2.5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="w-4/5 h-3.5 bg-gray-200 rounded animate-pulse mb-0.5"></div>

            <div className="w-3/5 h-2.5 bg-gray-200 rounded animate-pulse mb-1"></div>

            <div className="mt-auto pt-1">
              <div className="w-14 h-3.5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div
      className={`overflow-hidden flex flex-col h-full group relative transition-all duration-300 ${
        event.isExpired ? "opacity-50 grayscale" : ""
      }`}
    >
      <div className="relative h-full flex flex-col">
        <div className="relative h-80 md:h-96 lg:h-96 w-full overflow-hidden rounded-md">
          <button
            aria-label="Save to favorites"
            className="absolute top-1 right-1 p-1.5 rounded-full bg-white bg-opacity-70 hover:bg-opacity-90 transition-all duration-200 z-10"
            onClick={() => {
              console.log("Save to favorites clicked!"); // currently implementing
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-gray-700"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          {showEditButton && (
            <button
              onClick={() => router.push(`/manage/events/${event.id}/edit`)}
              className="absolute top-1 left-1 bg-white bg-opacity-90 text-gray-800 font-medium py-1.5 px-3 rounded-xl text-small hover:bg-opacity-100 transition-all duration-200 z-10"
            >
              Edit
            </button>
          )}
          <Link href={`/events/${event.id}`} className="block h-full">
            <Image
              src={event.imageUrl || "/placeholder.png"}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105 rounded-md"
            />

            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="absolute bottom-1.5 left-1.5 text-white text-sm flex items-center z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-2.5 h-2.5 mr-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </div>
          </Link>
        </div>

        <Link href={`/events/${event.id}`} className="block pt-1 pb-1.5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-medium truncate">{formatDate(event.startTime)}</span>
            <div className="flex items-center">
              {event &&
                (new Date().getTime() - new Date(event.createdAt).getTime()) / (1000 * 3600 * 24) <=
                  3 && (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-2.5 h-2.5 text-purple-600 mr-0.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 ml-1 text-sm font-medium truncate">New</span>
                  </>
                )}
            </div>
          </div>

          <h3 className="text-medium lg:text-lg font-medium text-gray-800 group-hover:text-purple-700 transition-colors duration-200 mb-0.5 line-clamp-1">
            {event.title}
          </h3>

          <div className="flex items-center text-gray-500 text-xs mb-0.5 truncate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 text-gray-500 mr-1"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-gray-500 text-sm truncate mr-2 font-medium">{event.location}</p>
          </div>

          <div className="mt-9">
            <div className="flex items-center">
              <span className="text-gray-800 text-small font-semibold">Free</span>
            </div>
          </div>
        </Link>

        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></div>
      </div>
    </div>
  );
}
