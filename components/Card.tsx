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
  const [activeIndex, setActiveIndex] = useState(0); // for pagination dots ("Instagram scrollbar")
  const router = useRouter();

  const handlePress = () => {
    return () => router.push(`/details/${id}` as any);
  };

  return (
    <TouchableOpacity onPress={handlePress()} activeOpacity={0.9}>
      <View style={styles.card}>
        <View style={styles.photoFrame}>
          {/*short-circuit*/}
          {images && images.length > 0 && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false} // ugly scrollbar, used pagination instead
                pagingEnabled
                contentContainerStyle={styles.galleryContainer}
                //Calculate the active index based on scroll position
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

        {/*Row: Rating, Name+Location, profile picture*/}
        <View style={styles.infoRow}>
          {/*Left: rating*/}
          <View style={styles.ratingBlock}>
            <Ionicons name="star" size={16} color="gold" />
            {rating && <Text style={styles.ratingText}>{rating}</Text>}
          </View>

          {/*Middle: Name + Location*/}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{name}</Text>
            {/*short-circuit*/}
            {location && (
              <View style={styles.locationRow}>
                <Text style={styles.subtitle}>
                  <Ionicons name="location-sharp"></Ionicons>
                  {location}
                </Text>
              </View>
            )}
          </View>

          {/*Right: profile picture*/}
          {profilePic && (
            <Image source={{ uri: profilePic }} style={styles.profileImg} />
          )}
        </View>
      </View>
    </TouchableOpacity>
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

  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "right",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },

  galleryContainer: {
    backgroundColor: "grey",
    height: 300,
  },

  galleryImage: {
    width: screenWidth - 50,
    height: 300,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 15,
    marginRight: 15,
  },

  ratingBlock: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 24,
    fontWeight: "500",
    color: "grey",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 5,
    justifyContent: "flex-end",
  },

  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginBottom: 10,
  },

  photoFrame: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 1,
  },
  pagingDot: {
    color: "#bbb",
    fontSize: 30,
    marginHorizontal: 2,
  },
  pagingDotActive: {
    color: "#333",
    fontSize: 30,
    marginHorizontal: 2,
  },
});
