import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { Users, itemType } from "../type/clippdTypes";

interface ClippdContextType {
  // Users
  users: Users[] | null;
  setUsers: React.Dispatch<React.SetStateAction<Users[] | null>>;
  refreshUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<Users | null>;
  // Clippers (mapped to itemType for UI components like Card)
  clippers: itemType[];
  isClippersLoading: boolean;
  clippersError: string | null;
  fetchClippers: () => Promise<void>;
}

export const ClippdContext = createContext<ClippdContextType | undefined>(
  undefined
);

export const ClippdProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Users state
  const [users, setUsers] = useState<Users[] | null>(null);
  // Clippers (for cards)
  const [clippers, setClippers] = useState<itemType[]>([]);
  const [isClippersLoading, setIsClippersLoading] = useState(false);
  const [clippersError, setClippersError] = useState<string | null>(null);

  // Prefer environment variable if provided
  // Use Azure web service for shared team access
  const BaseURL =
    process.env.EXPO_PUBLIC_API_URL ||
    "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";

  const refreshUsers = useCallback(async () => {
    try {
      const response = await fetch(`${BaseURL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: Users[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  }, [BaseURL]);

  const fetchUserById = useCallback(
    async (id: number): Promise<Users | null> => {
      try {
        const response = await fetch(`${BaseURL}/users/${id}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`Failed to fetch user ${id}`);
        }
        return (await response.json()) as Users;
      } catch (error) {
        console.error("Failed to load user:", error);
        return null;
      }
    },
    [BaseURL]
  );

  const fetchClippers = useCallback(async () => {
    setIsClippersLoading(true);
    setClippersError(null);
    try {
      const response = await fetch(`${BaseURL}/clippers`);
      if (!response.ok)
        throw new Error(`Failed to fetch clippers (${response.status})`);
      const raw = await response.json();
      // Map API response to itemType expected by Card
      const mapped: itemType[] = (raw || []).map((c: any) => ({
        id: String(c.id),
        name: [c.firstname, c.lastname].filter(Boolean).join(" "),
        location: [c.city, c.state].filter(Boolean).join(", "),
        images: c.images || [], // Use images from database
        rating:
          typeof c.rating === "string"
            ? parseFloat(c.rating)
            : typeof c.rating === "number"
            ? c.rating
            : 0,
        profilePic: c.profileimage || "",
        reviews: [],
      }));
      setClippers(mapped);
    } catch (error: any) {
      setClippersError(error.message || "Unknown error fetching clippers");
    } finally {
      setIsClippersLoading(false);
    }
  }, [BaseURL]);

  useEffect(() => {
    refreshUsers();
    fetchClippers();
  }, [refreshUsers, fetchClippers]);

  return React.createElement(
    ClippdContext.Provider,
    {
      value: {
        users,
        setUsers,
        refreshUsers,
        fetchUserById,
        clippers,
        isClippersLoading,
        clippersError,
        fetchClippers,
      },
    },
    children
  );
};

export function useClippd() {
  const ctx = useContext(ClippdContext);
  if (!ctx) throw new Error("useClippd must be used within ClippdProvider");
  return ctx;
}
