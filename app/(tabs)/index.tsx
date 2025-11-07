import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react"; // Import useState for modal visibility
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";

export default function App() {
  const data: itemType[] = itemData;
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffffff" }}
      edges={["bottom"]}
    >
      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 5, paddingBottom: 70 }}
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

        {/* Floating Filter Button */}
        <View style={styles.fabContainer}>
          <BlurView intensity={80} tint="light" style={styles.blurLayer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)} // Open the modal
              accessibilityRole="button"
              accessibilityLabel="Filter"
            >
              <Ionicons name="options-outline" size={30} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} // Close the modal
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Hello</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)} // Close the modal
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 74,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF4500",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
