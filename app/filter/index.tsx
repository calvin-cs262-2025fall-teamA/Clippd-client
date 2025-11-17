import React, { useState } from "react";
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
          title: "Personal Settings",
          headerLargeTitle: true,
          headerTitleStyle: { fontSize: 24, fontWeight: "700" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Personal Settings</Text>

        {/* Hair Type Dropdown */}
        <DropdownSection
          label="Hair Type"
          values={["Straight", "Curly", "Coily"]}
        />

        {/* Clippr Specialty Dropdown */}
        <DropdownSection
          label="Clippr Specialty"
          values={["Haircut", "Perm", "Beard Trim"]}
        />

        {/* Language Dropdown */}
        <DropdownSection
          label="Language"
          values={["Spanish", "Korean", "Nepali"]}
        />
      </ScrollView>
    </>
  );
}

/* -------------------------------------------------------
   Dropdown Component (rotating chevron + selectable values)
-------------------------------------------------------- */
function DropdownSection({ label, values }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.section}>
      {/* Header row with rotating chevron */}
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.dropdownHeader}
      >
        <Text style={styles.label}>{label}</Text>

        <Ionicons
          name="chevron-down"
          size={20}
          color="#666"
          style={{
            transform: [{ rotate: open ? "180deg" : "0deg" }],
            transition: "transform 0.2s",
          }}
        />
      </TouchableOpacity>

      {/* Expandable content */}
      {open &&
        values.map((v, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setSelected(v)}
            style={styles.valueRow}
          >
            <Text style={styles.value}>{v}</Text>

            {selected === v && (
              <Ionicons name="checkmark-outline" size={20} color="#000" />
            )}
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 80,
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

  /* DROPDOWN HEADER */
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },

  /* ROW FOR EACH VALUE */
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingRight: 4,
    alignItems: "center",
  },

  value: {
    fontSize: 16,
    color: "#666",
  },
});
