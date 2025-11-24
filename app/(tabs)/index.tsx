import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";
import FilterButton from "../components/filter_button"; // ✅ new import

export default function Home() {
  const data: itemType[] = itemData;

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
          {data.map((item) => (
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
