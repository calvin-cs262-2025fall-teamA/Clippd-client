import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { Users, itemType } from "../type/clippdTypes";
import { getApiUrl } from "../utils/networkConfig";

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
  const [baseUrl, setBaseUrl] = useState<string>("");

  // Initialize API URL on component mount
  useEffect(() => {
    const initializeUrl = async () => {
      try {
        const url = await getApiUrl();
        setBaseUrl(url);
      } catch (error) {
        console.error("[ClippdContext] Failed to detect API URL:", error);
      }
    };
    
    initializeUrl();
  }, []);

  const refreshUsers = useCallback(async () => {
    if (!baseUrl) {
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data: Users[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [baseUrl]);
  const fetchUserById = useCallback(
    async (id: number): Promise<Users | null> => {
      if (!baseUrl) return null;
      try {
        const response = await fetch(`${baseUrl}/users/${id}`);
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
    [baseUrl]
  );

  const fetchClippers = useCallback(async () => {
    if (!baseUrl) {
      console.log("[ClippdContext] fetchClippers: baseUrl not set yet");
      return;
    }
    setIsClippersLoading(true);
    setClippersError(null);
    try {
      const response = await fetch(`${baseUrl}/clippers`);
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
            ? c.rating
            : String(c.rating ?? "0"),
        profilePic: c.profileimage || "",
        reviews: c.reviews || [], // Use reviews from database
      }));
      setClippers(mapped);
    } catch (error: any) {
      console.error("[ClippdContext] fetchClippers error:", error.message);
      setClippersError(error.message || "Unknown error fetching clippers");
    } finally {
      setIsClippersLoading(false);
    }
  }, [baseUrl]);

  // Auto-fetch data when baseUrl is ready
  useEffect(() => {
    if (baseUrl) {
      console.log("[ClippdContext] baseUrl is ready, fetching data...");
      refreshUsers();
      fetchClippers();
    }
  }, [baseUrl, refreshUsers, fetchClippers]);

  // Check API URL periodically for WiFi changes
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (baseUrl) {
        const url = await getApiUrl();
        if (url !== baseUrl) {
          setBaseUrl(url);
        }
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [baseUrl]);
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
