import React, {
  createContext,
  ReactNode,
  useState,
  useContext,
  useCallback,
} from "react";

export interface FilterState {
  selectedServices: string[]; // e.g., ["Fade", "Taper"]
  selectedLanguages: string[]; // e.g., ["Spanish", "Korean"]
  priceRange: string | null; // e.g., "$0 – $20"
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  
  // Helper functions
  toggleService: (service: string) => void;
  toggleLanguage: (language: string) => void;
  setPriceRange: (range: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const FilterContext = createContext<FilterContextType | undefined>(
  undefined
);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    selectedServices: [],
    selectedLanguages: [],
    priceRange: null,
  });

  const toggleService = useCallback((service: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter((s) => s !== service)
        : [...prev.selectedServices, service],
    }));
  }, []);

  const toggleLanguage = useCallback((language: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(language)
        ? prev.selectedLanguages.filter((l) => l !== language)
        : [...prev.selectedLanguages, language],
    }));
  }, []);

  const setPriceRange = useCallback((range: string | null) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange === range ? null : range,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      selectedServices: [],
      selectedLanguages: [],
      priceRange: null,
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.selectedServices.length > 0 ||
      filters.selectedLanguages.length > 0 ||
      filters.priceRange !== null
    );
  }, [filters]);

  return React.createElement(
    FilterContext.Provider,
    {
      value: {
        filters,
        setFilters,
        toggleService,
        toggleLanguage,
        setPriceRange,
        clearFilters,
        hasActiveFilters,
      },
    },
    children
  );
};

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
}
