import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ClippdProvider } from "../contexts/ClippdContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ClippdProvider>
          <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ClippdProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
