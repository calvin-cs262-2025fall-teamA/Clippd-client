import React, { useEffect } from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import { useClippd } from "../../contexts/ClippdContext";
import FilterButton from "../components/filter_button";

export default function Home() {
  const { clippers, isClippersLoading, clippersError, fetchClippers } =
    useClippd();

  // Optional manual refresh on mount if not already triggered in provider
  useEffect(() => {
    if (clippers.length === 0) fetchClippers();
  }, [clippers.length, fetchClippers]);

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
          {isClippersLoading && (
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
            !clippersError &&
            clippers.map((item) => (
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
