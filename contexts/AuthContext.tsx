import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
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

      console.log("[AuthContext] checkAuth - token:", token);
      console.log("[AuthContext] checkAuth - userData:", userData);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log("[AuthContext] checkAuth - parsed user:", parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";
      console.log("[AuthContext] ========== LOGIN START ==========");
      console.log("[AuthContext] Email:", email);
      console.log("[AuthContext] Password:", password);
      console.log("[AuthContext] API URL:", apiUrl);

      const requestBody = { loginID: email, passWord: password };
      console.log("[AuthContext] Request body:", JSON.stringify(requestBody));

      console.log("[AuthContext] Fetching from:", `${apiUrl}/auth/login`);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("[AuthContext] Response received");
      console.log("[AuthContext] Status:", response.status);
      console.log("[AuthContext] Status OK:", response.ok);
      console.log("[AuthContext] Headers:", response.headers);

      const responseText = await response.text();
      console.log(
        "[AuthContext] Response text (first 1000 chars):",
        responseText.substring(0, 1000)
      );

      if (!response.ok) {
        console.error("[AuthContext] Response NOT OK");
        console.error("[AuthContext] Status:", response.status);
        console.error("[AuthContext] Response:", responseText);
        throw new Error(
          `Login failed with status ${response.status}: ${responseText}`
        );
      }

      console.log("[AuthContext] Parsing JSON...");
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("[AuthContext] Parsed data:", data);
      } catch (e) {
        console.error("[AuthContext] JSON parse error:", e);
        throw new Error("Invalid JSON response from server");
      }

      if (!data || !data.id) {
        console.error("[AuthContext] No user ID in response");
        throw new Error("No user data returned from server");
      }

      console.log("[AuthContext] User ID:", data.id);

      const token = `token_${Date.now()}`;
      const user = {
        id: String(data.id),
        email: data.emailaddress || email,
        firstName: data.firstname || "",
        lastName: data.lastname || "",
        role: data.role || "Client",
      };

      console.log("[AuthContext] Creating user object:", user);

      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));
      setUser(user);

      console.log("[AuthContext] ========== LOGIN SUCCESS ==========");
    } catch (error: any) {
      console.error("[AuthContext] ========== LOGIN ERROR ==========");
      console.error("[AuthContext] Error message:", error.message);
      console.error("[AuthContext] Error:", error);
      console.error("[AuthContext] ========== LOGIN ERROR END ==========");
      throw error;
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: string = "Client"
  ) => {
    try {
      if (!firstName || !lastName || !email || !password) {
        throw new Error("All fields are required");
      }

      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL ||
          "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net"
        }/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            loginID: email,
            passWord: password,
            role: role,
            emailAddress: email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[AuthContext] Signup error response:", errorData);
        throw new Error("Signup failed");
      }

      const data = await response.json();
      console.log("[AuthContext] Signup response:", data);

      const token = `token_${Date.now()}`;
      const newUser = {
        id: String(data.id || Date.now().toString()),
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role,
      };

      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      console.error("[AuthContext] Signup error:", error);
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
