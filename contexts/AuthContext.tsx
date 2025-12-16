/**
 * @fileoverview Authentication Context for Clippd App
 * 
 * This module provides authentication state management using React Context.
 * It handles user login, signup, logout, and persistent session management
 * using expo-secure-store for secure token and user data storage.
 * 
 * Features:
 * - User session persistence across app restarts
 * - Secure credential storage with expo-secure-store
 * - Role-based user types (Client/Clipper)
 * - Automatic session restoration on app startup
 * 
 * @example
 * // In your app root:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * // In components:
 * const { user, login, logout, isLoading } = useAuth(); 
 */

import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * @typedef {Object} AuthContextType
 * @property {User | null} user - Currently authenticated user or null if not logged in
 * @property {Function} login - Authenticates user with loginID and password
 * @property {Function} signup - Creates new user account with provided details
 * @property {Function} logout - Clears user session and tokens
 * @property {boolean} isLoading - Indicates if auth check is in progress on app start
 */
type AuthContextType = {
  user: User | null;
  login: (loginID: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    loginID: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier from database
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} [role] - User role: 'Client' or 'Clipper'
 * @property {string} [phoneNumber] - User's phone number
 * @property {string} [city] - User's city of residence
 * @property {string} [state] - User's state of residence
 * @property {string} [profileImage] - URL to user's profile picture
 * @property {string[]} [preferences] - User preferences array
 */
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  profileImage?: string;
  preferences?: string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Context provider that wraps the application and manages authentication state.
 * Automatically restores user session on app startup if credentials are stored.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that consume auth context
 * @returns {React.ReactElement} Provider component wrapping children
 * 
 * @example
 * <AuthProvider>
 *   <RootNavigator />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Checks for existing session on app startup
   * 
   * Attempts to restore user session from SecureStore by retrieving
   * stored user data and token. Sets isLoading to false when complete.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @private
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Restores user session from secure storage
   * 
   * Called on app startup to check if user has a valid session stored.
   * Silently fails if no session found - user redirected to login.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws Logs errors to console but doesn't throw (graceful degradation)
   */
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

  /**
   * Authenticates user with loginID and password
   * 
   * Makes API request to backend /auth/login endpoint. On success,
   * stores authentication token and user data in SecureStore for
   * persistent sessions. Updates local user state.
   * 
   * @async
   * @param {string} loginID - User's login identifier (username)
   * @param {string} password - User's password (plain text)
   * @returns {Promise<void>}
   * @throws {Error} Throws with descriptive message on auth failure
   * 
   * @example
   * try {
   *   await login('alice', 'password123');
   *   // User now logged in, navigation handles based on role
   * } catch (error) {
   *   Alert.alert('Login Failed', error.message);
   * }
   */
  const login = async (loginID: string, password: string) => {
    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";
      console.log("[AuthContext] ========== LOGIN START ==========");
      console.log("[AuthContext] LoginID:", loginID);
      console.log("[AuthContext] Password:", password);
      console.log("[AuthContext] API URL:", apiUrl);

      const requestBody = { loginID: loginID, passWord: password };
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

  /**
   * Creates a new user account
   * 
   * Registers new user with provided information. Backend determines
   * whether user is Client or Clipper based on role parameter.
   * On success, stores credentials and logs user in automatically.
   * 
   * @async
   * @param {string} firstName - User's first name (required)
   * @param {string} lastName - User's last name (required)
   * @param {string} loginID - Username for login (required, must be unique)
   * @param {string} email - Email address (required, must be unique)
   * @param {string} password - Password for account (required, minimum 6 chars)
   * @param {string} [role='Client'] - User role: 'Client' or 'Clipper'
   * @returns {Promise<void>}
   * @throws {Error} Validation or signup errors
   * 
   * @example
   * await signup(
   *   'Alice',
   *   'Meijer', 
   *   'alice123',
   *   'alice@example.com',
   *   'password123',
   *   'Client'
   * );
   */
  const signup = async (
    firstName: string,
    lastName: string,
    loginID: string,
    email: string,
    password: string,
    role: string = "Client"
  ) => {
    try {
      if (!firstName || !lastName || !loginID || !email || !password) {
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
            loginID: loginID,
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

  /**
   * Logs out the current user
   * 
   * Clears user session by removing stored tokens and user data
   * from SecureStore. Sets user state to null.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws Logs errors but doesn't throw (graceful degradation)
   * 
   * @example
   * await logout();
   * // User redirected to login screen by navigation handlers
   */
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

/**
 * Custom hook to access authentication context
 * 
 * Provides access to user state and authentication methods throughout
 * the application. Must be used within a component that is wrapped
 * by AuthProvider.
 * 
 * @returns {AuthContextType} Auth context with user, login, logout, etc.
 * @throws {Error} If used outside of AuthProvider component
 * 
 * @example
 * const { user, login, logout } = useAuth();
 * 
 * if (!user) {
 *   return <LoginScreen />;
 * }
 * 
 * return <HomeScreen />;
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";
      console.log("[AuthContext] ========== LOGIN START ==========");
      console.log("[AuthContext] LoginID:", loginID);
      console.log("[AuthContext] Password:", password);
      console.log("[AuthContext] API URL:", apiUrl);

      const requestBody = { loginID: loginID, passWord: password };
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
    loginID: string,
    email: string,
    password: string,
    role: string = "Client"
  ) => {
    try {
      if (!firstName || !lastName || !loginID || !email || !password) {
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
            loginID: loginID,
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
