import { itemType } from "@/type/clippdTypes";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Formats rating: if decimal part is 0, show as integer, otherwise round to 1 decimal place
 * 예: 4.0 → "4", 4.5 → "4.5", 4.33 → "4.3"
 */
function formatRating(rating: number | string | undefined): string {
  if (!rating) return "";
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return "";
  
  // Round to 1 decimal place
  const rounded = Math.round(num * 10) / 10;
  
  // If no decimal part, return as integer
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  // Otherwise return with 1 decimal place
  return rounded.toFixed(1);
}

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

  const [fontsLoaded] = useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"),
    "PlayfairDisplay-SemiBold": require("../assets/fonts/PlayfairDisplay-SemiBold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

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
          <Text style={styles.rating}>{formatRating(rating)}</Text>
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
    padding: 18,
    height: 110,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameWrapper: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  name: {
    fontSize: 20,
    fontFamily: "Lato-Bold",
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 13,
    fontFamily: "Lato-Regular",
    color: "#666",
    marginLeft: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  rating: {
    marginLeft: 4,
    fontSize: 15,
    fontFamily: "Lato-Bold",
    color: "#333",
  },
});
