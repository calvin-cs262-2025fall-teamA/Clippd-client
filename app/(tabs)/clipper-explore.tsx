import React, { useEffect, useState } from "react";
import { ScrollView, View, ActivityIndicator, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import { useClippd } from "../../contexts/ClippdContext";
import FilterButton from "../components/filter_button";
import { CLIPPER_HELP_INSTRUCTION } from "../../utils/help/ClipperHelpInstruction";

export default function Home() {
  const { clippers, isClippersLoading, clippersError, fetchClippers } =
    useClippd();
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [selectedHelpSection, setSelectedHelpSection] = useState(0);

  // Optional manual refresh on mount if not already triggered in provider
  useEffect(() => {
    if (clippers.length === 0) fetchClippers();
  }, [clippers.length, fetchClippers]);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setIsHelpModalVisible(true)}
              style={{ marginRight: 20 }}
            >
              <Ionicons name="help-circle-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />

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

      {/* Help Modal */}
      <Modal
        visible={isHelpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHelpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {CLIPPER_HELP_INSTRUCTION.documents[selectedHelpSection].title}
              </Text>
              <TouchableOpacity
                onPress={() => setIsHelpModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Overview */}
              <Text style={styles.overviewText}>
                {CLIPPER_HELP_INSTRUCTION.documents[selectedHelpSection].overview}
              </Text>

              {/* Table of Contents */}
              <View style={styles.tocContainer}>
                <Text style={styles.tocTitle}>Contents</Text>
                {CLIPPER_HELP_INSTRUCTION.toc.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tocItem,
                      selectedHelpSection === index &&
                        styles.tocItemActive,
                    ]}
                    onPress={() => setSelectedHelpSection(index)}
                  >
                    <Text
                      style={[
                        styles.tocItemText,
                        selectedHelpSection === index &&
                          styles.tocItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Steps Table */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
                  {CLIPPER_HELP_INSTRUCTION.documents[selectedHelpSection].title}
                </Text>
                <View style={styles.stepsTable}>
                  {CLIPPER_HELP_INSTRUCTION.documents[
                    selectedHelpSection
                  ].steps.map((step, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>
                          {step.number}
                        </Text>
                      </View>
                      <Text style={styles.stepInstruction}>
                        {step.instruction}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Navigation Buttons */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    selectedHelpSection === 0 &&
                      styles.navButtonDisabled,
                  ]}
                  onPress={() =>
                    setSelectedHelpSection(selectedHelpSection - 1)
                  }
                  disabled={selectedHelpSection === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={
                      selectedHelpSection === 0 ? "#ccc" : "#ff1a47"
                    }
                  />
                  <Text style={styles.navButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    selectedHelpSection ===
                      CLIPPER_HELP_INSTRUCTION.documents.length - 1 &&
                      styles.navButtonDisabled,
                  ]}
                  onPress={() =>
                    setSelectedHelpSection(selectedHelpSection + 1)
                  }
                  disabled={
                    selectedHelpSection ===
                    CLIPPER_HELP_INSTRUCTION.documents.length - 1
                  }
                >
                  <Text style={styles.navButtonText}>Next</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      selectedHelpSection ===
                      CLIPPER_HELP_INSTRUCTION.documents.length - 1
                        ? "#ccc"
                        : "#ff1a47"
                    }
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsHelpModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "90%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  overviewText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "500",
  },
  tocContainer: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tocTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  tocItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  tocItemActive: {
    backgroundColor: "#ff1a47",
  },
  tocItemText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  tocItemTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },
  stepsTable: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ff1a47",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  stepInstruction: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ff1a47",
    gap: 6,
  },
  navButtonDisabled: {
    borderColor: "#ccc",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff1a47",
  },
  closeButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ff1a47",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
