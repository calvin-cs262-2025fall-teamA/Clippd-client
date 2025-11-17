import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Redirect, Tabs } from "expo-router";
import { Scissors } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    "Lato-Bold": require("../../assets/fonts/Lato-Bold.ttf"),
    "Lato-Regular": require("../../assets/fonts/Lato-Regular.ttf"),
    "PlayfairDisplay-SemiBold": require("../../assets/fonts/PlayfairDisplay-SemiBold.ttf"),
    "PlayfairDisplay-Regular": require("../../assets/fonts/PlayfairDisplay-Regular.ttf"),
    "PlayfairDisplay-Bold": require("../../assets/fonts/PlayfairDisplay-Bold.ttf"),
    "DMSans-Bold": require("../../assets/fonts/DMSans-Bold.ttf"),
    "DMSans-SemiBold": require("../../assets/fonts/DMSans-SemiBold.ttf"),
    "DMSans-Regular": require("../../assets/fonts/DMSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ff1a47",
        tabBarInactiveTintColor: "#9c9c9cff",
        headerStyle: {
          height: 100,
          backgroundColor: "#ffffffff",
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          height: 80,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#ffffffff",
          position: "absolute",
          paddingTop: 5,
          paddingBottom: 13,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 27,
            fontFamily: "Lato-Bold",
            color: "#000000ff",
          },
          headerLeft: () => (
            <View style={{ marginLeft: 137 }}>
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
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: "PlayfairDisplay-Bold",
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
        }}
      />

      {/* Booking (center floating button) */}
      {/* <Tabs.Screen
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
      /> */}

      {/* Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 25,
            fontFamily: "PlayfairDisplay-Bold",
            color: "black",
          },
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

      {/* Hide details/[id] route
      <Tabs.Screen
        name="details/[id]"
        options={{
          href: null, // hides this route from the tab bar
        }}
      /> */}
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
