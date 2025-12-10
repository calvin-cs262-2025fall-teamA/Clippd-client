import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function FilterScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Personal Settings",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 6, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical={true}
      >

        {/* Hair Type Dropdown */}
        <DropdownSection
          label="Hair Type"
          values={["Straight", "Wavy", "Curly", "Coily"]}
        />

        {/* Secondary Hair Type */}
        <DropdownSection
          label="Secondary Hair Type"
          values={["Thick", "Thin", "Frizzy", "Damaged"]}
        />

        {/* Clipper Services (NESTED) */}
        <DropdownSection
          label="Clipper Services"
          values={[
            {
              label: "Haircuts",
              values: ["Fade", "Taper", "Scissor Cut", "Layer cut", "Bob/Long Bob", "Buzz Cut", "Trim & Shape up"]
            },
            {label: "Styling",
              values: ["Blowout", "Curling/Waves", "Straightening", "Special Event Hairstlye"]
            },
            {
              label: "Coloring",
              values: ["Full Color", "Highlights", "Balayage", "Root Touch-up", "Bleach + Tone"]
            },
            {
              label: "Treatments",
              values: ["Perm", "Keratin", "Relaxer"]
            },
            {label: "Facial / Beard Care",
              values: ["Beard Trim", "Beard Shaping", "Hot Towel Shave"]
            }
          ]}
        />

        {/* Language Dropdown */}
        <DropdownSection
          label="Language"
          values={["Spanish", "Korean", "Nepali"]}
        />

        {/* Price Range Dropdown */}
        <DropdownSection
          label="Price Range"
          values={["$0 – $20", "$20 – $40", "$40 – $60", "$60 – $100", "$100+"]}
        />
      </ScrollView>
    </>
  );
}

/* -------------------------------------------------------
   Nested + normal Dropdown Component
-------------------------------------------------------- */
function DropdownSection({ label, values }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Detect if values contain nested sections
  const isNested = values.length > 0 && typeof values[0] === "object";

  return (
    <View style={styles.section}>
      {/* Header */}
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
          }}
        />
      </TouchableOpacity>

      {/* NESTED DROPDOWNS */}
      {open && isNested &&
        values.map((section, idx) => (
          <View key={idx} style={{ paddingLeft: 15 }}>
            <DropdownSection label={section.label} values={section.values} />
          </View>
        ))}

      {/* FLAT VALUES */}
      {open && !isNested &&
        values.map((v, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setSelected(selected === v ? null : v)}
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
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
