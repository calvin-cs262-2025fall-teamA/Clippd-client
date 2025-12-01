import { useFavorites } from "@/contexts/FavoritesContext";
import { useClippd } from "@/contexts/ClippdContext";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { itemType } from "../../type/clippdTypes";
import { useState } from "react";

/**
 * Formats rating: if decimal part is 0, show as integer, otherwise round to 1 decimal place
 */
function formatRating(rating: number | string | undefined): string {
  if (!rating) return "";
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return "";
  
  const rounded = Math.round(num * 10) / 10;
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  return rounded.toFixed(1);
}

export default function DetailsPage() {
  const { id } = useLocalSearchParams();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { clippers, isClippersLoading } = useClippd();
  
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Find clipper from API data
  const clippr: itemType | undefined = clippers.find((item) => item.id === id);

  const favorited = isFavorited(id as string);

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(id as string);
    } else {
      addFavorite(id as string);
    }
  };

  const handleAddReview = () => {
    if (reviewText.trim()) {
      const newReview = {
        id: (reviews.length || 0) + 1,
        reviewerName: "You",
        reviewContent: reviewText,
        date: new Date().toLocaleDateString(),
      };
      setReviews([newReview, ...(clippr?.reviews || [])]);
      setReviewText("");
      setShowReviewInput(false);
    }
  };

  if (isClippersLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!clippr) {
    return (
      <View style={styles.container}>
        <Text>Clippr not found</Text>
      </View>
    );
  }

  // Group images: 1 large (left) + 2 small (right)
  const imageGroups: string[][] = [];
  if (clippr.images && clippr.images.length > 0) {
    for (let i = 0; i < clippr.images.length; i += 3) {
      imageGroups.push(clippr.images.slice(i, i + 3));
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Clippr Details",
          headerLeft: () => (
            <TouchableOpacity
              onPress={router.back}
              style={{ marginLeft: 6, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={toggleFavorite} style={{ marginRight: 15 }}>
              <Ionicons
                name={favorited ? "heart" : "heart-outline"}
                size={24}
                color={favorited ? "red" : "black"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* ---- Image Grid Section ---- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {imageGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.imageGroup}>
              {/* Large image on left */}
              <Image source={{ uri: group[0] }} style={styles.largeImage} />

              {/* Two stacked images on right */}
              <View style={styles.sideImageGrid}>
                {group.slice(1, 3).map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.sideImage}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.details}>
          <View style={styles.headerRow}>
            <Image
              source={{
                uri:
                  clippr.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png",
              }}
              style={styles.profileImage}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{clippr.name}</Text>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={20} color={"red"} />{" "}
                {clippr.location}
              </Text>
            </View>
            <Text style={styles.rating}>
              <Ionicons name="star" size={20} color="gold" />
              {formatRating(clippr.rating)}
            </Text>
          </View>
        </View>

        {/* <View style={styles.chipContainer}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>⭐ {clippr.rating}</Text>
            </View>
          </View> */}
        {/* ---- Reviews ---- */}
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity
              onPress={() => setShowReviewInput(!showReviewInput)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {showReviewInput && (
            <View style={styles.reviewInputContainer}>
              <TextInput
                style={styles.reviewInput}
                placeholder="Write your review here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
              />
              <View style={styles.reviewButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReviewInput(false);
                    setReviewText("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddReview}
                  disabled={!reviewText.trim()}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(reviews.length > 0 || clippr?.reviews?.length) ? (
            (reviews.length > 0 ? reviews : clippr?.reviews || []).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  {review.date && (
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  )}
                </View>
                <Text style={styles.reviewContent}>{review.reviewContent}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  clipprContent: {
    backgroundColor: "#dfdfdf57",
    borderRadius: 8,
    width: "97%",
    alignSelf: "center",
    marginBottom: 20,
  },

  // --- Image Grid Section ---
  imageScroll: {
    width: "98%",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
  },
  imageGroup: {
    flexDirection: "row",
    marginHorizontal: 4,
    gap: 8,
  },
  largeImage: {
    width: 330,
    height: 300,
    borderRadius: 10,
  },
  sideImageGrid: {
    justifyContent: "space-between",
  },
  sideImage: {
    width: 160,
    height: 148,
    borderRadius: 8,
  },

  // --- Content ---
  details: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 0,
  },
  locationText: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  rating: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
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

  // --- Reviews ---
  reviewContainer: {
    padding: 20,
    paddingTop: 0,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    padding: 8,
  },
  reviewInputContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  reviewButtonContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  submitButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: -10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
});
