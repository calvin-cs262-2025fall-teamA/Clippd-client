import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FilterScreen() {
  const router = useRouter();

  return (
    <>
      {/* Configure header for this page */}
      <Stack.Screen
        options={{
          title: "Filters",
          headerLargeTitle: true,
          headerTitleStyle: { fontSize: 24, fontWeight: "700" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Dating Preferences</Text>

        {/* Example sections you can expand later */}
        <View style={styles.section}>
          <Text style={styles.label}>Interested in</Text>
          <Text style={styles.value}>Women</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age range</Text>
          <Text style={styles.value}>20 – 32</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Maximum distance</Text>
          <Text style={styles.value}>35 mi</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Religion</Text>
          <Text style={styles.value}>Open to all</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#666",
  },
});
