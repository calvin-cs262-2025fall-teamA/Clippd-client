import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: () => (
            <Ionicons name="home-outline" size={24} color="black" />
          ),
          title: "Home",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        }}
      />
      <Tabs.Screen
        name="details/[id]"
        options={{
          href: null,
          title: "",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: () => (
            <Ionicons name="map-outline" size={24} color="black" />
          ),
          title: "Map",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: () => (
            <Ionicons name="heart-outline" size={24} color="black" />
          ),
          title: "Favorites",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: () => (
            <Ionicons name="person-outline" size={24} color="black" />
          ),
          title: "Profile",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
        }}
      />
    </Tabs>
  );
}
