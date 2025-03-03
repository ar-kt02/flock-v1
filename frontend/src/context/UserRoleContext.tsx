"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { getUserRole } from "@/lib/api";
import { getAuthCookie } from "@/lib/auth";

interface UserRoleContextType {
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

interface UserRoleProviderProps {
  children: React.ReactNode;
}

export const UserRoleProvider = ({ children }: UserRoleProviderProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = getAuthCookie();
      if (token) {
        const role = await getUserRole(token);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
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
