/**
 * @fileoverview Root layout component for the Clippd application
 * @description Wraps the entire app with necessary providers (Auth, Filter, Favorites, Clippd)
 * and sets up the root navigation structure using Expo Router Stack
 * @version 1.0.0
 */

import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { ClippdProvider } from "../contexts/ClippdContext";

/**
 * Root layout component that provides all necessary context providers and navigation structure
 * @component
 * @returns {JSX.Element} The root application layout wrapped with providers
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <FilterProvider>
        <FavoritesProvider>
          <ClippdProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="details/[id]" options={{ headerShown: true }} />
              <Stack.Screen name="filter/index" options={{ headerShown: true }} />
            </Stack>
          </ClippdProvider>
        </FavoritesProvider>
      </FilterProvider>
    </AuthProvider>
  );
}
