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
  // Update clipper profile
  updateClipperProfile: (
    clipperId: string,
    updatedData: Partial<ClipperProfile>
  ) => void;
  updateClipperProfile: (clipperId: string, updatedData: Partial<ClipperProfile>) => void;
  // Filter clippers
  getFilteredClippers: (
    selectedServices: string[],
    selectedLanguages: string[],
    priceRange: string | null
  ) => Promise<ClipperProfile[]>;
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
      console.log("[ClippdContext] Raw clipper data from API:", raw);
      // Map API response to ClipperProfile expected by Card
      const mapped: ClipperProfile[] = await Promise.all(
        (raw || []).map(async (c: any) => {
          console.log("[ClippdContext] Processing clipper:", {
            id: c.id,
            firstName: c.firstName,
            emailAddress: c.emailAddress,
            phone: c.phone,
          });
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
            userId: c.userid || c.userID, // Store the UserAccount ID for language queries
            name: [c.firstName || c.firstname, c.lastName || c.lastname]
              .filter(Boolean)
              .join(" "),
            location: [c.city, c.state].filter(Boolean).join(", "),
            images: c.images || [], // Use images from database
            rating:
              typeof c.rating === "string" ? c.rating : String(c.rating ?? "0"),
            profilePic: c.profileimage || c.profileImage || "",
            bio: c.bio || "", // Use bio from database
            address: c.address || "", // Use address from database (consistent with bio)
            phone: c.phone || "", // Use phone from database
            emailAddress: c.emailAddress || c.emailaddress || "", // Use email from database
            reviews: c.reviews || [], // Use reviews from database
            services: services, // Use services from database
          };
        })
      );
      console.log("[ClippdContext] Mapped clippers with contact info:", mapped);
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

  const updateClipperProfile = useCallback(
    (clipperId: string, updatedData: Partial<ClipperProfile>) => {
      setClippers((prevClippers) =>
        prevClippers.map((clipper) =>
          clipper.id === clipperId ? { ...clipper, ...updatedData } : clipper
        )
      );
    },
    []
  );

  // Filter clippers based on services, languages, and price range
  const getFilteredClippers = useCallback(
    async (
      selectedServices: string[],
      selectedLanguages: string[],
      priceRange: string | null
    ): Promise<ClipperProfile[]> => {
      // If no filters selected, return all clippers
      if (
        selectedServices.length === 0 &&
        selectedLanguages.length === 0 &&
        !priceRange
      ) {
        return clippers;
      }

      // Helper function to get price range bounds
      const getPriceBounds = (
        range: string
      ): { min: number; max: number } => {
        const ranges: {
          [key: string]: { min: number; max: number };
        } = {
          "$0 – $20": { min: 0, max: 20 },
          "$20 – $40": { min: 20, max: 40 },
          "$40 – $60": { min: 40, max: 60 },
          "$60 – $100": { min: 60, max: 100 },
          "$100+": { min: 100, max: Infinity },
        };
        return ranges[range] || { min: 0, max: Infinity };
      };

      const filtered = await Promise.all(
        clippers.map(async (clipper) => {
          // Fetch languages for this clipper using userId (not clipperId)
          let clipperLanguages: string[] = [];
          try {
            if (baseUrl && clipper.userId) {
              console.log(`[Filter] Fetching languages for userId: ${clipper.userId}, clipper: ${clipper.name}`);
              const languagesResponse = await fetch(
                `${baseUrl}/users/${clipper.userId}/languages`
              );
              if (languagesResponse.ok) {
                const rawLanguages = await languagesResponse.json();
                console.log(`[Filter] Raw language response for ${clipper.name}:`, rawLanguages);
                
                clipperLanguages = (rawLanguages || []).map(
                  (l: any) => l.language
                );
                console.log(`[Filter] Parsed languages for ${clipper.name}:`, clipperLanguages);
              } else {
                console.warn(`[Filter] Language API error for ${clipper.name}:`, languagesResponse.status);
              }
            } else {
              console.warn(`[Filter] Missing baseUrl or userId for ${clipper.name}`);
            }
          } catch (err) {
            console.warn(
              `Failed to fetch languages for clipper ${clipper.id}:`,
              err
            );
          }

          // Check language filter
          if (
            selectedLanguages.length > 0 &&
            !selectedLanguages.some((lang) =>
              clipperLanguages.includes(lang)
            )
          ) {
            console.log(`[Filter] ${clipper.name} filtered out - no matching language. Selected: ${selectedLanguages}, Has: ${clipperLanguages}`);
            return null;
          }

          // Check service filter
          if (selectedServices.length > 0) {
            const hasService = (clipper.services || []).some((service) =>
              selectedServices.includes(service.serviceName)
            );
            if (!hasService) {
              return null;
            }
          }

          // Check price range filter
          if (priceRange) {
            const { min, max } = getPriceBounds(priceRange);
            const hasServiceInRange = (clipper.services || []).some(
              (service) => {
                const price = service.price || 0;
                return price >= min && price <= max;
              }
            );
            if (!hasServiceInRange) {
              return null;
            }
          }

          return clipper;
        })
      );

      return filtered.filter((c) => c !== null) as ClipperProfile[];
    },
    [clippers, baseUrl]
  );

  // Debug: Log filtered clippers
  useEffect(() => {
    if (typeof getFilteredClippers === "function") {
      // This runs after context is ready
    }
  }, [getFilteredClippers]);

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
        updateClipperProfile,
        getFilteredClippers,
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
