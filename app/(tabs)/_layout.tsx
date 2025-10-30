import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { Scissors } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Lato-Regular": require("../../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../../assets/fonts/Lato-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ff1a47",
        tabBarInactiveTintColor: "#9c9c9cff",
        headerStyle: {
          height: 105,
          backgroundColor: "#111",
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          height: 75,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#1f1f1fff",
          position: "absolute",
          marginBottom: 20,
          borderRadius: 30,
          width: "96%",
          marginHorizontal: "2%",
          opacity: 0.95,
          paddingTop: 11,
          paddingBottom: 13,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Lato-Bold",
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitleAlign: "left",
          headerTitleStyle: {
            fontSize: 22,
            fontFamily: "Lato-Bold",
            marginLeft: 5,
            color: "#fff",
          },
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Scissors color="#ff1a47" size={32} />
            </View>
          ),
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
          href: null,
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
    backgroundColor: "#ff1a47",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 25 : 20,
    shadowColor: "#ff1a47",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
