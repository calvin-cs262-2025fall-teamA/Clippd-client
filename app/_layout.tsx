import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#F5C32C", // yellow active color
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#fff",
          position: "absolute",
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Explore (Map) */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Explore",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Booking (center floating button) */}
      <Tabs.Screen
        name="booking"
        options={{
          title: "",
          headerShown: false,
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <FontAwesome5 name="cut" size={24} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Hide details/[id] route */}
      <Tabs.Screen
        name="details/[id]"
        options={{
          href: null, // hides this route from the tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 25 : 20,
  },
});
