import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserData {
  // Basic user info
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  userRole: string;
  // Signup profile info
  phone?: string;
  address?: string;
  country?: string;
  code?: string;
  selectedCategories?: string[];
  // Page info (nested for clarity)
  page?: {
    pageName?: string;
    banner?: string;
    description?: string;
    address?: string;
    country?: string;
    phone?: string;
    code?: string;
    // Add more page-specific fields as needed
  };
  // Other info
  description?: string;
  // Add more fields as needed for signup steps
  [key: string]: any;
}

interface AuthContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userData, setUserDataState] = useState<UserData | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) setUserDataState(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  }, [userData]);

  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
  };

  const updateUserData = (data: Partial<UserData>) => {
    setUserDataState((prev) =>
      prev ? { ...prev, ...data } : ({ ...data } as UserData)
    );
  };

  const clearUserData = () => {
    setUserDataState(null);
  };

  const logout = () => {
    // Clear all user data
    clearUserData();
    // Clear any other stored data
    localStorage.clear();
    // Reload the page to reset the app state
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, updateUserData, clearUserData, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
