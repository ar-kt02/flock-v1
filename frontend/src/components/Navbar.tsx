"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { deleteAuthCookie, getAuthCookie } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { useUserRole } from "@/context/UserRoleContext";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const [showManageLink, setShowManageLink] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { userRole } = useUserRole();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthCookie();
      setIsLoggedIn(!!token);
      setShowManageLink(userRole === "ORGANIZER" || userRole === "ADMIN");
    };
    checkAuth();
  }, [pathname, userRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogout = async () => {
    const token = getAuthCookie();
    if (token) {
      try {
        await logoutUser(token);
        deleteAuthCookie();
        setIsLoggedIn(false);
        router.push("/login");
      } catch (error: unknown) {
        setError((error as Error).message || "An unexpected error occurred");
      }
    }
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav ref={navRef} className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-end space-x-8">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setIsToggled((prev) => !prev);
                router.push("/");
              }}
              className={`text-4xl font-bold transition-all duration-500 ${
                isToggled
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent"
                  : "text-gray-800"
              }`}
              aria-label="Go to Home"
            >
              Eventuré
            </Link>
            <Link
              href="/events"
              className="hidden sm:block text-lg font-medium text-gray-800 hover:text-gray-600"
            >
              {`What's On`}
            </Link>
          </div>

          <div className="hidden sm:flex items-center space-x-8">
            {isLoggedIn && (
              <>
                <Link
                  href="/tickets"
                  onClick={closeMenus}
                  className="text-lg font-medium text-gray-800 hover:text-gray-600"
                >
                  My Tickets
                </Link>
              </>
            )}

            {showManageLink && (
              <Link
                href="/manage"
                onClick={closeMenus}
                className="text-lg font-medium text-gray-800 hover:text-gray-600"
              >
                Manage
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                className="flex items-center text-gray-800 hover:text-gray-600 focus:outline-none"
              >
                <User className="w-8 h-8" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-white border border-gray-300 shadow-xl rounded-md overflow-hidden"
                  role="menu"
                >
                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMenus}
                        className="block px-6 py-4 text-xl text-gray-800 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMenus}
                        className="block px-6 py-4 text-xl text-gray-800 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        onClick={closeMenus}
                        className="block px-6 py-4 text-xl text-gray-800 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          closeMenus();
                          handleLogout();
                        }}
                        className="block w-full text-left px-6 py-4 text-xl text-gray-800 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Log Out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="sm:hidden relative w-8 h-8 text-gray-800 hover:text-gray-600 focus:outline-none"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          >
            <Menu
              className={`absolute inset-0 w-8 h-8 transition-all duration-300 transform ${
                isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
              }`}
              aria-hidden={isMenuOpen}
            />
            <X
              className={`absolute inset-0 w-8 h-8 transition-all duration-300 transform ${
                isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
              }`}
              aria-hidden={!isMenuOpen}
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-300 shadow-md">
          <div className="px-6 pt-4 pb-4 space-y-3">
            {isLoggedIn && (
              <>
                <Link
                  href="/tickets"
                  onClick={closeMenus}
                  className="block text-xl font-medium text-gray-800 hover:text-gray-600"
                >
                  My Tickets
                </Link>
                <Link
                  href="/profile"
                  onClick={closeMenus}
                  className="block text-xl font-medium text-gray-800 hover:text-gray-600"
                >
                  Profile
                </Link>
              </>
            )}

            {showManageLink && (
              <Link
                href="/manage"
                onClick={closeMenus}
                className="block text-xl font-medium text-gray-800 hover:text-gray-600"
              >
                Manage
              </Link>
            )}
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="block text-xl font-medium text-gray-800 hover:text-gray-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="block text-xl font-medium text-gray-800 hover:text-gray-600"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    closeMenus();
                    handleLogout();
                  }}
                  className="w-full text-left text-xl font-medium text-gray-800 hover:text-gray-600"
                >
                  Log Out
                </button>
              </>
            )}
          </div>

          <div className="border-t border-gray-300"></div>
          <div className="px-6 pt-4 pb-4">
            <Link
              href="/events"
              onClick={closeMenus}
              className="block text-xl font-medium text-gray-800 hover:text-gray-600"
            >
              {`What's On`}
            </Link>
          </div>
        </div>
      )}
      {error && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-sm py-2 px-4 rounded-md shadow-lg transition-opacity duration-300 ease-out"
          style={{ opacity: error ? 1 : 0 }}
        >
          {error}
        </div>
      )}
    </nav>
  );
}
