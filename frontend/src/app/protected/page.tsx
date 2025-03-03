"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/lib/auth";

export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAuthCookie();
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError(null);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="block text-gray-700 text-center text-2xl font-bold mb-4">Protected Page</h1>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
