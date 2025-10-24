import { Stack } from "expo-router";
import React from "react";
import {
  Button,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Profile() {
  const openDirections = () => {
    const latitude = 42.9303;
    const longitude = -85.5873;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Profile" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-photo/barber-scissors-straight-razor-barber-shop-suit-vintage-barbershop-shaving-portrait-beard-man-mustache-men-brutal-guy-scissors-straight-razor-bearded-client-visiting-barber-shop_293990-2196.jpg?w=360",
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Calvin Klein</Text>
          <Text style={styles.headline}>
            Senior Stylist at Calvin University
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.field}>Phone: (555) 123-4567</Text>
          <Text style={styles.field}>Email: calvin.klein@calvin.edu</Text>
          <Text style={styles.field}>Location: Boston, MA</Text>
          <Pressable onPress={openDirections}>
            <Button title="Get Directions" onPress={openDirections} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.field}>Preferred Tools: Clippers, Shears</Text>
          <Text style={styles.field}>Languages: English, Spanish</Text>
          <Text style={styles.field}>Availability: Mon-Fri, 9am - 5pm</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.field}>
            Passionate stylist with 8+ years experience creating modern and
            classic men&apos;s haircuts. I focus on clean lines and client
            communication to ensure each visit leaves the client feeling
            confident.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  headline: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  field: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
});
