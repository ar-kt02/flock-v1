"use client";

import { useState, useEffect } from "react";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  const [randomMisadventure, setRandomMisadventure] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const misadventures = [
      "This page seems to have wandered off...",
      "The event you're looking for has temporarily disappeared...",
      "Apologies, this page is currently unavailable...",
      "We can't quite locate this experience right now...",
      "Seems like this event has taken an unexpected turn...",
    ];
    setRandomMisadventure(misadventures[Math.floor(Math.random() * misadventures.length)]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute -top-4 -left-4 -right-4 h-8 bg-purple-50 transform rotate-2 border-b border-dashed border-purple-200"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 items-center">
              〈✖∇✖〉
            </div>
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              404
            </div>
            {randomMisadventure && (
              <p className="text-xl text-gray-600 font-medium mb-6">{randomMisadventure}</p>
            )}
          </div>

          <div className="space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an event..."
                className="w-full px-4 py-2 pr-10 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
              >
                <Search size={20} />
              </button>
            </form>

            <div className="flex justify-center">
              <Link
                href="/"
                className="flex items-center space-x-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
