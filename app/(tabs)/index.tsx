import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 72,
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  blurLayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
});
