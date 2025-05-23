"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { getUserRole, ApiError } from "@/lib/api";
import { deleteAuthCookie, getAuthCookie } from "@/lib/auth";

interface UserRoleContextType {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  roleError: Error | null;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

interface UserRoleProviderProps {
  children: React.ReactNode;
}

export const UserRoleProvider = ({ children }: UserRoleProviderProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = getAuthCookie();
      if (token) {
        try {
          const role = await getUserRole(token);
          setUserRole(role);
          setRoleError(null);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            deleteAuthCookie();
          }
          setUserRole(null);
          const authError = error instanceof Error ? error : new Error("Authentication required");
          setRoleError(authError);
        }
      } else {
        setUserRole(null);
        setRoleError(null);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole, roleError }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};
