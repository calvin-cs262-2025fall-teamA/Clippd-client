import { itemType } from "@/type/itemType";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function Card({
  id,
  name,
  location,
  images,
  rating,
  profilePic,
}: itemType) {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const handlePress = () => {
    router.push(`/details/${id}` as any);
  };

  return (
    <View style={styles.card}>
      <View style={styles.photoFrame}>
        {images && images.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              contentContainerStyle={styles.galleryContainer}
              onScroll={(event) => {
                const slide = Math.ceil(
                  event.nativeEvent.contentOffset.x /
                    event.nativeEvent.layoutMeasurement.width
                );
                if (slide !== activeIndex) {
                  setActiveIndex(slide);
                }
              }}
              scrollEventThrottle={16}
            >
              {images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>

            <View style={styles.pagination}>
              {images.map((_, index) => (
                <Text
                  key={index}
                  style={
                    index === activeIndex
                      ? styles.pagingDotActive
                      : styles.pagingDot
                  }
                >
                  •
                </Text>
              ))}
            </View>
          </>
        )}
      </View>

      {/* ✅ Only wrap the info section with TouchableOpacity */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.infoRow}>
          {profilePic && (
            <Image source={{ uri: profilePic }} style={styles.profileImg} />
          )}

          <View style={styles.textContainer}>
            <Text style={styles.name}>{name}</Text>
            {location && (
              <View style={styles.locationRow}>
                <Text style={styles.location}>
                  <Ionicons name="location-sharp"></Ionicons>
                  {location}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.ratingBlock}>
            <Ionicons name="star" size={16} color="gold" />
            {rating && <Text style={styles.ratingText}>{rating}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 15,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 20,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    overflow: "hidden",
  },

  textContainer: {
    padding: 10,
    flex: 1,
  },

  name: {
    fontSize: 22,
    fontFamily: "Lato-Bold",
    textAlign: "left",
  },

  location: {
    fontSize: 14,
    fontFamily: "Lato-Regular",
    color: "#666",
    marginTop: 4,
    textAlign: "left",
  },

  galleryContainer: {
    height: 300,
  },

  galleryImage: {
    width: screenWidth - 20,
    height: 300,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 35,
  },

  ratingBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 20,
    fontFamily: "Lato-Bold",
    color: "grey",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 5,
    justifyContent: "flex-start",
  },

  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginBottom: 10,
  },

  photoFrame: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 5,
    position: "absolute",
    bottom: -40,
    left: 0,
    right: 0,
  },
  pagingDot: {
    color: "#cfcfcfff",
    fontSize: 25,
    marginHorizontal: 2,
    textShadowColor: "rgba(66, 66, 66, 0.5)",
    textShadowRadius: 3,
  },
  pagingDotActive: {
    color: "#6e6e6eff",
    fontSize: 25,
    marginHorizontal: 2,
    textShadowColor: "rgba(82, 82, 82, 0.5)",
    textShadowRadius: 3,
  },
});
