import { Ionicons } from "@expo/vector-icons"; // ✅ ADDED: icon for the button
import { BlurView } from "expo-blur"; // ✅ ADDED: for frosted-glass effect
import {
  ScrollView, // ✅ ADDED
  StyleSheet,
  TouchableOpacity, // ✅ ADDED
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";

export default function App() {
  const data: itemType[] = itemData;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ffffffff" }}
      edges={["bottom"]}
    >
      {/* ✅ ADDED: wrapper so the floating button can be absolutely positioned */}
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

        {/* ✅ ADDED: Glassmorphic Floating Button (bottom-right, above tab bar) */}
        <View style={styles.fabContainer}>
          <BlurView intensity={80} tint="light" style={styles.blurLayer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {}} // intentionally no functionality
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="options-outline" size={30} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ✅ ADDED: styles for the glassy (frosted) circular button
const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 74, // hard-coded as you prefer; tweak to sit above your tab bar
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden", // keeps the blur inside the circle
    // subtle depth like iOS
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
    // translucent white tint over the blur for a glassy look
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    // fine highlight edge like iOS
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
});
