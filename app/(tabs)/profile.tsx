import { Stack } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  // Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('[Profile] User:', user);
    console.log('[Profile] Is Loading:', isLoading);
  }, [user, isLoading]);

  // const openDirections = () => {
  //   const latitude = 42.9303;
  //   const longitude = -85.5873;
  //   const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  //   Linking.openURL(url);
  // };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // generic customer avatar
            }}
            style={styles.headerImage}
          />

          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
          </Text>
          <Text style={styles.location}>Grand Rapids, MI</Text>
        </View>

        {/* Card Row */}
        <View style={styles.cardContainer}>
          {/* Contact */}
          <View style={styles.contactCard}>
            <Text style={styles.fieldHeader}>Contact</Text>
            <Text style={styles.field}>Phone: (555) 123-4567</Text>
            <Text style={styles.field}>Email: {user ? user.email : "customer@email.com"}</Text>
          </View>

          {/* Preferences */}
          <View style={styles.preferencesCard}>
            <Text style={styles.fieldHeader}>Preferences</Text>
            <View style={styles.chipContainer}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Fade Cuts</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Beard Trim</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 80,
  },

  /* Header */
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
  },
  headerImage: {
    width: 160,
    height: 160,
    borderRadius: 999,
    marginBottom: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },

  /* Cards */
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    padding: 15,
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  preferencesCard: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    padding: 15,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  /* Text */
  fieldHeader: {
    color: "#111",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  field: {
    color: "#333",
    fontSize: 14,
    marginBottom: 6,
  },

  /* Chips */
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#eaeaea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    color: "#222",
  },
});
