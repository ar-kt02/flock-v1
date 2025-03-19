"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setAuthCookie } from "@/lib/auth";
import { login } from "../../lib/api";
import { useUserRole } from "@/context/UserRoleContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userRole } = useUserRole();

  useEffect(() => {
    if (userRole) {
      router.push("/");
    }
  }, [userRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await login(email, password);
      setAuthCookie(token);
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Invalid credentials");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-purple-normal text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold">Login</h1>
          <p className="text-purple-100 mt-1">Access your account</p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-black"
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="block text-gray-700 font-medium" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-800">
                  Forgot password?
                </a>
              </div>
              <input
                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-black"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account? <br></br>
              <a href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
                Create account
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
