import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FilterButton() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.fabContainer}>
        <BlurView intensity={80} tint="light" style={styles.blurLayer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/filter")} // 👈 navigates to new full-screen page
            accessibilityRole="button"
            accessibilityLabel="Filter"
          >
            <Ionicons name="options-outline" size={30} color="white" />
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", right: 16, bottom: 74, zIndex: 10 },
  fabContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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