import { itemType } from "@/type/itemType";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SmallCard({
  id,
  name,
  location,
  rating,
  profilePic,
}: itemType) {
  const router = useRouter();

  const handlePress = () => {
    return () => router.push(`/details/${id}` as any);
  };

  return (
    <TouchableOpacity onPress={handlePress()} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Left: Profile Picture */}
        {profilePic && (
          <Image source={{ uri: profilePic }} style={styles.profileImg} />
        )}

        {/* Middle: Name and Location */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={12} color="#666" />
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>

        {/* Right: Rating */}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="gold" />
          <Text style={styles.rating}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 6,
    borderRadius: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
