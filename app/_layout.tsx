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
        }}
      />
      <Tabs.Screen
        name="details/[id]"
        options={{
          href: null,
          title: "Clippr Details",
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: () => (
            <Ionicons name="heart-outline" size={24} color="black" />
          ),
          title: "Favorites",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: () => (
            <Ionicons name="person-outline" size={24} color="black" />
          ),
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
