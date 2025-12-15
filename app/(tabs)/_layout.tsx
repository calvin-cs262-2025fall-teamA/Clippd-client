import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Redirect, Tabs } from "expo-router";
import { Scissors } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    "Lato-Bold": require("../../assets/fonts/Lato-Bold.ttf"),
    "Lato-Regular": require("../../assets/fonts/Lato-Regular.ttf"),
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
      {/* Barber Profile - First tab for Clipper role */}
      <Tabs.Screen
        name="barber-profile"
        options={{
          title: "You",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="cut-outline" size={24} color={color} />
          ),
          href: user?.role === "Clipper" ? undefined : null,
        }}
      />

      {/* Clipper Explore - Second tab for Clipper role */}
      <Tabs.Screen
        name="clipper-explore"
        options={{
          title: "Explore",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 27,
            fontFamily: "Lato-Bold",
            color: "#000000ff",
          },
          headerLeft: () => (
            <View style={{ marginLeft: 120 }}>
              <Scissors color="#ff1a47" size={32} />
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
          href: user?.role === "Clipper" ? undefined : null,
        }}
      />

      {/* Home - For Client role only */}
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
          href: user?.role === "Clipper" ? null : undefined,
        }}
      />

      {/* Explore (Map) - HIDDEN */}
      <Tabs.Screen
        name="map"
        options={{
          title: "Explore",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 20,
            fontFamily: "Lato-Bold",
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="map-outline" size={24} color={color} />
          ),
          href: user.role === "Clipper" ? null : undefined,
        }}
      />

      {/* Favorites */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 25,
            fontFamily: "Lato-Bold",
            color: "black",
          },
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={24} color={color} />
          ),
          href: user.role === "Clipper" ? null : undefined,
        }}
      />

      {/* Profile - Only visible for Client role */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
          href: user.role === "Clipper" ? null : undefined,
        }}
      />
    </Tabs>
  );
}
