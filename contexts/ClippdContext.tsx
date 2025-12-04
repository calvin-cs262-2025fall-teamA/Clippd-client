import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { Users, ClipperProfile, Service } from "../type/clippdTypes";
import { getApiUrl } from "../utils/networkConfig";

interface ClippdContextType {
  // Users
  users: Users[] | null;
  setUsers: React.Dispatch<React.SetStateAction<Users[] | null>>;
  refreshUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<Users | null>;
  // Clippers (mapped to ClipperProfile for UI components like Card)
  clippers: ClipperProfile[];
  isClippersLoading: boolean;
  clippersError: string | null;
  fetchClippers: () => Promise<void>;
  // Update clipper rating
  updateClipperRating: (clipperId: string, newRating: number) => void;
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
  const [clippers, setClippers] = useState<ClipperProfile[]>([]);
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
      // Map API response to ClipperProfile expected by Card
      const mapped: ClipperProfile[] = await Promise.all(
        (raw || []).map(async (c: any) => {
          // Fetch services for this clipper
          let services: Service[] = [];
          try {
            const servicesResponse = await fetch(
              `${baseUrl}/clippers/${c.id}/services`
            );
            if (servicesResponse.ok) {
              const rawServices = await servicesResponse.json();
              // Normalize services to handle case sensitivity from PostgreSQL
              services = rawServices.map((s: any) => ({
                id: s.id,
                clipperID: s.clipperid || s.clipperID,
                serviceName: s.servicename || s.serviceName,
                price: s.price,
                durationMinutes: s.durationminutes || s.durationMinutes,
              }));
              console.log(
                `[ClippdContext] Fetched ${services.length} services for clipper ${c.id}:`,
                services
              );
            }
          } catch (err) {
            console.warn(`Failed to fetch services for clipper ${c.id}:`, err);
          }

          return {
            id: String(c.id),
            name: [c.firstName || c.firstname, c.lastName || c.lastname]
              .filter(Boolean)
              .join(" "),
            location: [c.city, c.state].filter(Boolean).join(", "),
            images: c.images || [], // Use images from database
            rating:
              typeof c.rating === "string" ? c.rating : String(c.rating ?? "0"),
            profilePic: c.profileimage || c.profileImage || "",
            bio: c.bio || "", // Use bio from database
            reviews: c.reviews || [], // Use reviews from database
            services: services, // Use services from database
          };
        })
      );
      setClippers(mapped);
    } catch (error: any) {
      console.error("[ClippdContext] fetchClippers error:", error.message);
      setClippersError(error.message || "Unknown error fetching clippers");
    } finally {
      setIsClippersLoading(false);
    }
  }, [baseUrl]);

  // Update a specific clipper's rating
  const updateClipperRating = useCallback(
    (clipperId: string, newRating: number) => {
      setClippers((prevClippers) =>
        prevClippers.map((clipper) =>
          clipper.id === clipperId
            ? { ...clipper, rating: String(newRating) }
            : clipper
        )
      );
    },
    []
  );

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
        updateClipperRating,
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
