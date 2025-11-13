import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const userData = await SecureStore.getItemAsync("userData");

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      // For now, mock login
      if (email && password) {
        const mockUser = {
          id: "1",
          email: email,
          firstName: "John",
          lastName: "Doe",
        };

        const mockToken = `token_${Date.now()}`;

        await SecureStore.setItemAsync("userToken", mockToken);
        await SecureStore.setItemAsync("userData", JSON.stringify(mockUser));

        setUser(mockUser);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      // TODO: Replace with actual API call
      // For now, mock signup
      if (firstName && lastName && email && password) {
        const newUser = {
          id: Date.now().toString(),
          email,
          firstName,
          lastName,
        };

        const mockToken = `token_${Date.now()}`;

        await SecureStore.setItemAsync("userToken", mockToken);
        await SecureStore.setItemAsync("userData", JSON.stringify(newUser));

        setUser(newUser);
      } else {
        throw new Error("All fields are required");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
