"use client";

import Link from "next/link";
import Event from "@/types/event";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden flex flex-col h-full group relative transition-all duration-300">
        <div className="relative h-full flex flex-col">
          <div className="relative h-80 w-full overflow-hidden rounded-md bg-gray-200 animate-pulse"></div>

          <div className="pt-2 pb-4 flex flex-col flex-grow">
            <div className="flex items-center mb-1">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mr-3"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="w-4/5 h-6 bg-gray-200 rounded animate-pulse mb-1"></div>

            <div className="w-3/5 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>

            <div className="mt-auto pt-2">
              <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="overflow-hidden flex flex-col h-full group relative transition-all duration-300">
      <div className="relative h-full flex flex-col">
        <div className="relative h-80 w-full overflow-hidden rounded-md">
          <Link href={`/events/${event.id}`} className="block h-full w-full">
            <Image
              src={event.imageUrl || "/placeholder.png"}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-md"
            />
          </Link>

          <button
            aria-label="Save to favorites"
            className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-90 transition-all duration-200"
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
            <Link
              href={`/manage/events/${event.id}/edit`}
              className="absolute top-3 left-3 bg-white bg-opacity-90 text-gray-800 font-medium py-1 px-3 rounded-full text-sm hover:bg-opacity-100 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Edit
            </Link>
          )}
        </div>

        <div className="pt-2 pb-4 flex flex-col flex-grow">
          <div className="flex items-center text-sm mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-purple-600 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700 mr-3">{(Math.random() * 3.9 + 1).toFixed(1)}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 ml-3">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/events/${event.id}`} className="block">
            <h3 className="text-lg font-medium text-gray-800 group-hover:text-purple-700 transition-colors duration-200 mb-1">
              {event.title}
            </h3>
          </Link>

          {/* Location and date */}
          <div className="text-gray-500 text-sm mb-2">
            {event.location} · {formatDate(event.startTime)}
          </div>

          <div className="mt-auto pt-2">
            <div className="flex items-center">
              <span className="text-gray-800 font-medium">Free</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-0 h-1 bg-purple-600 transition-all duration-300 group-hover:w-full"></div>
      </div>
    </div>
  );
}
