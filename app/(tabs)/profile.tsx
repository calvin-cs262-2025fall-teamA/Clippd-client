import { Stack } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
  const openDirections = () => {
    const latitude = 42.9303;
    const longitude = -85.5873;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-photo/barber-scissors-straight-razor-barber-shop-suit-vintage-barbershop-shaving-portrait-beard-man-mustache-men-brutal-guy-scissors-straight-razor-bearded-client-visiting-barber-shop_293990-2196.jpg?w=360",
            }}
            style={styles.headerImage}
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,1)"]}
            style={styles.gradient}
          >
            <Text style={styles.name}>Isaac Hur</Text>
            <Text style={{ color: "#fff", fontSize: 15 }}>
              {" "}
              Grand Rapids, MI
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.contactCard}>
            <Text style={styles.fieldHeader}>Contact</Text>
            <Text style={styles.field}>Phone: (555) 123-4567</Text>
            <Text style={styles.field}>Email: calvin.klein@calvin.edu</Text>
          </View>

          <View style={styles.preferencesCard}>
            <Text style={styles.fieldHeader}>Preferences</Text>
            <View style={styles.chipContainer}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Clippers</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Shears</Text>
              </View>
            </View>
          </View>
        </View>

        {/* <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.field}>Phone: (555) 123-4567</Text>
          <Text style={styles.field}>Email: calvin.klein@calvin.edu</Text>
          <Pressable onPress={openDirections}>
            <Button title="Get Directions" onPress={openDirections} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Text style={styles.fieldTitle}>Preferred Tools</Text>
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Clippers</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Shears</Text>
            </View>
          </View>

          <Text style={styles.fieldTitle}>Languages</Text>
          <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>English</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Spanish</Text>
            </View>
          </View>

          <Text style={styles.field}>Availability: Mon-Fri, 9am - 5pm</Text>
        </View> */}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000ff",
  },
  header: {
    position: "relative",
    height: 450,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 10,
  },
  name: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "600",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 15,
    minHeight: 200,
  },
  preferencesCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 15,
    minHeight: 150,
  },
  fieldHeader: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  field: {
    color: "#999",
    fontSize: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    color: "#fff",
  },
});
