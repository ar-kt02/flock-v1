"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Registration failed. Please try again.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-purple-normal text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold">Create Account</h1>
          <p className="text-purple-100 mt-1">Join our platform today</p>
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
              <p className="mt-1 text-xs text-gray-500">
                We&apos;ll never share your email with any third party
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-black"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use at least 8 characters with a mix of letters, numbers & symbols.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-black"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-purple-600 hover:text-purple-800">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 hover:text-purple-800">
                  Privacy Policy
                </a>
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
                  Signing up...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <div className="text-center mb-6">
              <h3 className="text-xl font-medium text-gray-900 mt-4">Registration Successful!</h3>
              <p className="text-gray-500 mt-2">
                Your account has been created successfully. You can now log in with your account
                details.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleLoginRedirect}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
