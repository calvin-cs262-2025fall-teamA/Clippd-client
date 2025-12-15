/**
 * @fileoverview Filter screen component for Clippd application
 * @description Provides filtering interface for searching and filtering clippers
 * by services, languages, price ranges, and ratings
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  // Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFilter } from "../../contexts/FilterContext";

/**
 * Service categories with available service options
 * @type {Array<{label: string, values: string[]}>}
 */
const SERVICE_CATEGORIES = [
  {
    label: "Haircuts",
    values: [
      "Fade",
      "Taper",
      "Scissor Cut",
      "Layer cut",
      "Bob/Long Bob",
      "Buzz Cut",
      "Trim & Shape up",
    ],
  },
  {
    label: "Styling",
    values: [
      "Blowout",
      "Curling/Waves",
      "Straightening",
      "Special Event Hairstyle",
    ],
  },
  {
    label: "Coloring",
    values: [
      "Full Color",
      "Highlights",
      "Balayage",
      "Root Touch-up",
      "Bleach + Tone",
    ],
  },
  {
    label: "Treatments",
    values: ["Perm", "Keratin", "Relaxer"],
  },
  {
    label: "Facial / Beard Care",
    values: ["Beard Trim", "Beard Shaping", "Hot Towel Shave"],
  },
];

/**
 * Available languages for filtering
 * @type {string[]}
 */
const LANGUAGES = ["Spanish", "Korean", "Nepali"];

/**
 * Price range options for filtering
 * @type {string[]}
 */
const PRICE_RANGES = [
  "$0 – $20",
  "$20 – $40",
  "$40 – $60",
  "$60 – $100",
  "$100+",
];

/**
 * Filter screen component for searching and filtering clippers
 * @component
 * @returns {JSX.Element} Filter screen with service, language, price, and rating options
 */
export default function FilterScreen() {
  const router = useRouter();
  const {
    filters,
    toggleService,
    toggleLanguage,
    setPriceRange,
    clearFilters,
  } = useFilter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Filter Clippers",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 6, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleClearFilters}
              style={{ marginRight: 16 }}
            >
              <Text
                style={{ color: "#ff1a47", fontSize: 14, fontWeight: "600" }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical={true}
      >
        {/* Clipper Services (NESTED) */}
        <DropdownSection
          label="Clipper Services"
          values={SERVICE_CATEGORIES}
          isNested={true}
          selectedItems={filters.selectedServices}
          onToggle={toggleService}
        />

        {/* Language Dropdown */}
        <DropdownSection
          label="Language"
          values={LANGUAGES}
          isNested={false}
          selectedItems={filters.selectedLanguages}
          onToggle={toggleLanguage}
        />

        {/* Price Range Dropdown */}
        <DropdownSection
          label="Price Range"
          values={PRICE_RANGES}
          isNested={false}
          selectedItems={filters.priceRange ? [filters.priceRange] : []}
          onToggle={(price) => setPriceRange(price)}
        />

        {/* Apply Filters Button */}
        {filters.selectedServices.length > 0 ||
        filters.selectedLanguages.length > 0 ||
        filters.priceRange ? (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </>
  );

  function handleClearFilters() {
    clearFilters();
  }

  function handleApplyFilters() {
    router.back();
  }
}

/* -------------------------------------------------------
   Nested + normal Dropdown Component
-------------------------------------------------------- */
function DropdownSection({
  label,
  values,
  isNested,
  selectedItems,
  onToggle,
}: {
  label: string;
  values: any[];
  isNested: boolean;
  selectedItems: string[];
  onToggle: (item: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleCategory = (categoryIdx: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryIdx]: !prev[categoryIdx],
    }));
  };

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

      {/* NESTED DROPDOWNS - Category Headers */}
      {open &&
        isNested &&
        values.map((section, idx) => (
          <View key={idx} style={{ marginTop: 10 }}>
            {/* Category Header (Haircuts, Styling, etc) */}
            <TouchableOpacity
              onPress={() => toggleCategory(idx)}
              style={[styles.categoryHeader, { paddingLeft: 15 }]}
            >
              <Text style={styles.categoryTitle}>{section.label}</Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#666"
                style={{
                  transform: [
                    { rotate: openCategories[idx] ? "180deg" : "0deg" },
                  ],
                }}
              />
            </TouchableOpacity>

            {/* Category Items (Fade, Taper, etc) */}
            {openCategories[idx] &&
              section.values.map((v: string, vIdx: number) => (
                <TouchableOpacity
                  key={vIdx}
                  onPress={() => onToggle(v)}
                  style={[styles.valueRow, { paddingLeft: 35 }]}
                >
                  <Text style={styles.value}>{v}</Text>
                  {selectedItems.includes(v) && (
                    <Ionicons
                      name="checkmark-outline"
                      size={20}
                      color="#ff1a47"
                    />
                  )}
                </TouchableOpacity>
              ))}
          </View>
        ))}

      {/* FLAT VALUES */}
      {open &&
        !isNested &&
        values.map((v: string, idx: number) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onToggle(v)}
            style={styles.valueRow}
          >
            <Text style={styles.value}>{v}</Text>

            {selectedItems.includes(v) && (
              <Ionicons name="checkmark-outline" size={20} color="#ff1a47" />
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
    paddingBottom: 100,
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
    fontWeight: "600",
  },

  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },

  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingRight: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  /* ROW FOR EACH VALUE */
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingRight: 4,
    alignItems: "center",
  },

  value: {
    fontSize: 15,
    color: "#666",
  },

  applyButton: {
    backgroundColor: "#ff1a47",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
