import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 70 },
        tabBarIcon: ({ color, size }) => {
          // map route names to icon names
          let name: any = "home";
          if (route.name === "favorites") name = "heart";
          else if (route.name === "profile") name = "person";
          else if (route.name === "index") name = "home";
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      {/* Order: Home, Favorites, Profile */}
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: "Favorites", tabBarLabel: "Favorites" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarLabel: "Profile" }}
      />
    </Tabs>
  );
}
