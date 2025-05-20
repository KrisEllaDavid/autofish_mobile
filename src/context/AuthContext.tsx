import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserData {
  name: string;
  email: string;
  avatar?: string;
  userRole: string;
  selectedCategories?: string[];
  address?: string;
  pageName?: string;
  country?: string;
  phone?: string;
  code?: string;
  description?: string;
  [key: string]: any;
}

interface AuthContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  updateUserData: (data: Partial<UserData>) => void;
  clearUserData: () => void;
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

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, updateUserData, clearUserData }}
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
