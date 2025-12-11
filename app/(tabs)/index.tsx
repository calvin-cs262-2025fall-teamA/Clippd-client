import React, { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import Card from "../../components/Card";
import { useClippd } from "../../contexts/ClippdContext";
import { useAuth } from "../../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useFilter } from "../../contexts/FilterContext";
import { ClipperProfile } from "../../type/clippdTypes";
import FilterButton from "../components/filter_button";

export default function Home() {
  const {
    clippers,
    isClippersLoading,
    clippersError,
    fetchClippers,
    getFilteredClippers,
  } = useClippd();
  const { user } = useAuth();
  const { filters, hasActiveFilters } = useFilter();
  const [displayedClippers, setDisplayedClippers] = useState<ClipperProfile[]>(
    []
  );
  const [isFiltering, setIsFiltering] = useState(false);

  // Optional manual refresh on mount if not already triggered in provider
  useEffect(() => {
    if (clippers.length === 0) fetchClippers();
  }, [clippers.length, fetchClippers]);

  // Update displayed clippers when filters change
  useFocusEffect(
    React.useCallback(() => {
      const applyFilters = async () => {
        setIsFiltering(true);
        try {
          console.log("[Home] Applying filters:", {
            selectedServices: filters.selectedServices,
            selectedLanguages: filters.selectedLanguages,
            priceRange: filters.priceRange,
            totalClippers: clippers.length,
          });

          const filtered = await getFilteredClippers(
            filters.selectedServices,
            filters.selectedLanguages,
            filters.priceRange
          );

          console.log("[Home] Filtered results:", {
            count: filtered.length,
            clippers: filtered.map((c) => ({
              id: c.id,
              name: c.name,
              userId: c.userId,
            })),
          });

          setDisplayedClippers(filtered);
        } catch (error) {
          console.error("Error applying filters:", error);
          setDisplayedClippers([]);
        } finally {
          setIsFiltering(false);
        }
      };

      applyFilters();
    }, [filters, clippers, getFilteredClippers])
  );

  // Redirect Clippers to their profile page (index is hidden for them anyway)
  if (user?.role === "Clipper") {
    return <Redirect href="/(tabs)/barber-profile" />;
  }

  // Determine which clippers to display
  // If filters are active, show only filtered results (even if empty)
  // If no filters, show all clippers
  const clippersToDisplay = hasActiveFilters() ? displayedClippers : clippers;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffffff" }}
      edges={["bottom"]}
    >
      <View style={{ flex: 1, position: "relative" }}>
        {/* Scrollable list of cards */}
        <ScrollView
          contentContainerStyle={{ paddingTop: 5, paddingBottom: 65 }}
        >
          {(isClippersLoading || isFiltering) && (
            <View style={{ paddingTop: 60 }}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {!isClippersLoading && clippersError && (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#d11" }}>
              {clippersError}
            </Text>
          )}
          {!isClippersLoading &&
            !isFiltering &&
            !clippersError &&
            clippersToDisplay.length === 0 && (
              <Text
                style={{ textAlign: "center", marginTop: 40, color: "#999" }}
              >
                No clippers found matching your filters
              </Text>
            )}
          {!isClippersLoading &&
            !isFiltering &&
            !clippersError &&
            clippersToDisplay.map((item) => (
              <Card
                id={item.id}
                key={item.id}
                name={item.name}
                location={item.location}
                images={item.images}
                rating={item.rating}
                profilePic={item.profilePic}
              />
            ))}
        </ScrollView>

        {/* Floating Filter Button (logic lives inside FilterButton.tsx) */}
        <FilterButton />
      </View>
    </SafeAreaView>
  );
}
