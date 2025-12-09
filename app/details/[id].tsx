import { useAuth } from "@/contexts/AuthContext";
import { useClippd } from "@/contexts/ClippdContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  PanResponder,
  GestureResponderEvent,
  Linking,
} from "react-native";
import { ClipperProfile } from "../../type/clippdTypes";

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

/**
 * Formats date as MM-dd-yyyy
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  } catch {
    return "";
  }
}

/**
 * Open Google Maps with address
 */
function openGoogleMaps(address: string, location: string): void {
  if (!address || !address.trim()) {
    Alert.alert("No address", "Address information is not available");
    return;
  }

  const searchQuery = `${address}, ${location}`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const googleMapsUrl = `https://www.google.com/maps/search/${encodedQuery}`;

  Linking.openURL(googleMapsUrl).catch(() => {
    Alert.alert("Error", "Could not open Google Maps");
  });
}

export default function DetailsPage() {
  const { id } = useLocalSearchParams();
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const { clippers, isClippersLoading, updateClipperRating } = useClippd();
  const { user } = useAuth();

  const [showReviewInput, setShowReviewInput] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [, setIsLoadingReviews] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioCurrentIndex, setPortfolioCurrentIndex] = useState(0);
  const panResponderRef = useRef<PanResponder | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Find clipper from API data
  const clippr: ClipperProfile | undefined = clippers.find(
    (item) => item.id === id
  );

  // Load reviews from database
  const loadReviews = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingReviews(true);
      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";

      const response = await fetch(`${apiUrl}/clippers/${id}/reviews`);
      const responseText = await response.text();

      console.log("[DetailsPage] Response status:", response.status);
      console.log("[DetailsPage] Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to load reviews: ${response.status} - ${responseText}`
        );
      }

      const data = JSON.parse(responseText);

      console.log("[DetailsPage] Loaded reviews:", data?.length || 0);
      console.log("[DetailsPage] ALL reviews:", JSON.stringify(data, null, 2));
      console.log(
        "[DetailsPage] Current user:",
        user ? `ID: ${user.id}, Type: ${typeof user.id}` : "Not logged in"
      );

      // Log ownership check for each review
      if (data && Array.isArray(data)) {
        data.forEach((review, index) => {
          console.log(
            `[DetailsPage] Review ${index}: clientid=${
              review.clientid
            } (type: ${typeof review.clientid}), userId=${
              user?.id
            } (type: ${typeof user?.id}), Match: ${
              parseInt(user?.id || "0") === review.clientid
            }`
          );
        });
      }

      setReviews(data || []);
    } catch (error) {
      console.error("[DetailsPage] Error loading reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [id, user]);

  // Load reviews when component mounts or id changes
  useEffect(() => {
    loadReviews();
  }, [id, loadReviews]);

  // Reload reviews when screen is focused (back button returns here)
  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews])
  );

  // Setup pan responder for detecting downward swipe to close portfolio modal
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: () => {},
      onPanResponderRelease: (evt, gestureState) => {
        // Detect downward swipe (dy > 100 means swiped down)
        if (gestureState.dy > 100 && showPortfolioModal) {
          setShowPortfolioModal(false);
        }
      },
    });
  }, [showPortfolioModal]);

  // Scroll to correct image when portfolio modal opens
  useEffect(() => {
    if (showPortfolioModal && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: portfolioCurrentIndex,
          animated: false,
        });
      }, 0);
    }
  }, [showPortfolioModal, portfolioCurrentIndex]);

  const favorited = isFavorited(id as string);

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(id as string);
    } else {
      addFavorite(id as string);
    }
  };

  const handleAddReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Error", "Please enter a review");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to add a review");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";

      const endpoint = `${apiUrl}/clippers/${id}/reviews`;

      const requestBody = {
        clientID: parseInt(user.id),
        clipperID: parseInt(id as string),
        rating: reviewRating,
        comment: reviewText,
      };

      console.log(
        "[DetailsPage] Submitting review:",
        JSON.stringify(requestBody)
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log("[DetailsPage] Response status:", response.status);
      console.log("[DetailsPage] Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to submit review: ${response.status} - ${responseText}`
        );
      }

      const result = JSON.parse(responseText);
      console.log("[DetailsPage] Review submitted successfully:", result);

      // Update clipper rating in context (for main screen)
      if (result.averageRating !== undefined) {
        updateClipperRating(id as string, result.averageRating);
        // Also update local clippr object
        if (clippr) {
          clippr.rating = result.averageRating;
        }
      }

      // Clear form
      setReviewText("");
      setReviewRating(5);
      setShowReviewInput(false);
      Alert.alert("Success", "Review submitted successfully!");

      // Reload reviews from database
      await loadReviews();
    } catch (error: any) {
      console.error("[DetailsPage] Error submitting review:", error);
      Alert.alert("Error", error.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = (reviewId: number) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const apiUrl =
                process.env.EXPO_PUBLIC_API_URL ||
                "https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net";

              const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                throw new Error(`Failed to delete review: ${response.status}`);
              }

              const result = await response.json();
              console.log("[DetailsPage] Review deleted successfully:", result);

              // Update clipper rating in context (for main screen)
              if (result.averageRating !== undefined) {
                updateClipperRating(id as string, result.averageRating);
                // Also update local clippr object
                if (clippr) {
                  clippr.rating = result.averageRating;
                }
              }

              Alert.alert("Success", "Review deleted successfully!");

              // Reload reviews from database
              await loadReviews();
            } catch (error: any) {
              console.error("[DetailsPage] Error deleting review:", error);
              Alert.alert("Error", error.message || "Failed to delete review");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setShowReviewInput(false);
    setReviewText("");
    setReviewRating(5);
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
        <Text>Clipper not found</Text>
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
          title: "Clipper Details",
          headerLeft: () => (
            <TouchableOpacity
              onPress={router.back}
              style={{ marginLeft: 6, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleFavorite}
              style={{ marginRight: 15 }}
            >
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
        {imageGroups.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {imageGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.imageGroup}>
                {/* Large image on left */}
                <TouchableOpacity
                  onPress={() => {
                    const imageIndex = groupIndex * 3;
                    setPortfolioCurrentIndex(imageIndex);
                    setShowPortfolioModal(true);
                  }}
                >
                  <Image source={{ uri: group[0] }} style={styles.largeImage} />
                </TouchableOpacity>

                {/* Two stacked images on right */}
                <View style={styles.sideImageGrid}>
                  {group.slice(1, 3).map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        const imageIndex = groupIndex * 3 + index + 1;
                        setPortfolioCurrentIndex(imageIndex);
                        setShowPortfolioModal(true);
                      }}
                    >
                      <Image
                        source={{ uri: img }}
                        style={styles.sideImage}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noImagesPlaceholder}>
            <Ionicons name="image-outline" size={60} color="#ccc" />
            <Text style={styles.noImagesText}>No images</Text>
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.headerRow}>
            {clippr.profilePic ? (
              <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{
                      uri: clippr.profilePic,
                    }}
                    style={styles.profileImage}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.defaultProfileIcon}>
                <Ionicons name="person" size={50} color="#999" />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{clippr.name}</Text>
              <TouchableOpacity
                onPress={() => openGoogleMaps(clippr.address || "", clippr.location)}
              >
                <Text style={styles.locationText}>
                  <Ionicons name="location-outline" size={20} color={"red"} />{" "}
                  {clippr.location}
                </Text>
              </TouchableOpacity>
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
            {user?.role !== "Clipper" && (
              <TouchableOpacity
                onPress={() => setShowReviewInput(!showReviewInput)}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={22} color="#000000ff" />
              </TouchableOpacity>
            )}
          </View>

          {showReviewInput && (
            <View style={styles.reviewInputContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.ratingInputContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewRating(star)}
                  >
                    <Ionicons
                      name={star <= reviewRating ? "star" : "star-outline"}
                      size={32}
                      color={star <= reviewRating ? "#FFB800" : "#ccc"}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
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
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmittingReview && styles.submitButtonDisabled,
                  ]}
                  onPress={handleAddReview}
                  disabled={isSubmittingReview || !reviewText.trim()}
                >
                  {isSubmittingReview ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {reviews.length > 0 || clippr?.reviews?.length ? (
            (reviews.length > 0 ? reviews : clippr?.reviews || []).map(
              (review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewHeaderLeft}>
                      <Text style={styles.reviewerName}>
                        {review.reviewerName}
                      </Text>
                      {(review.rating || review.rating === 0) && (
                        <View style={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={
                                star <= review.rating ? "star" : "star-outline"
                              }
                              size={16}
                              color={star <= review.rating ? "#FFB800" : "#ccc"}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={styles.reviewHeaderRight}>
                      {review.createdat && (
                        <Text style={styles.reviewDate}>
                          {formatDate(review.createdat)}
                        </Text>
                      )}
                      {user &&
                      review.clientid &&
                      parseInt(user.id) === review.clientid ? (
                        <View style={styles.reviewActions}>
                          <TouchableOpacity
                            onPress={() => handleDeleteReview(review.id)}
                            style={styles.deleteActionButton}
                          >
                            <Ionicons name="trash" size={18} color="#FF3B30" />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.reviewContent}>
                    {review.reviewContent || review.comment}
                  </Text>
                </View>
              )
            )
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Profile Image Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.profileCloseButton}
              onPress={() => setShowProfileModal(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            {clippr.profilePic && (
              <Image
                source={{ uri: clippr.profilePic }}
                style={styles.fullProfileImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Portfolio Images Modal with Sliding */}
      <Modal
        visible={showPortfolioModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPortfolioModal(false)}
      >
        <View
          style={styles.modalBackdrop}
          {...(panResponderRef.current ? panResponderRef.current.panHandlers : {})}
        >
          <View style={styles.portfolioModalContainer}>
            <TouchableOpacity
              style={styles.portfolioCloseButton}
              onPress={() => setShowPortfolioModal(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            {clippr.images && clippr.images.length > 0 && (
              <>
                <FlatList
                  ref={flatListRef}
                  data={clippr.images}
                  renderItem={({ item }) => (
                    <View style={styles.portfolioSlideContainer}>
                      <Image
                        source={{ uri: item }}
                        style={styles.portfolioFullImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  pagingEnabled
                  scrollEventThrottle={16}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={3}
                  updateCellsBatchingPeriod={50}
                  initialNumToRender={2}
                  windowSize={3}
                  onScrollToIndexFailed={() => {
                    // Handle scroll to index failure gracefully
                  }}
                  onMomentumScrollEnd={(event) => {
                    const contentOffsetX =
                      event.nativeEvent.contentOffset.x;
                    const screenWidth = Dimensions.get("window").width;
                    const index = Math.round(contentOffsetX / screenWidth);
                    setPortfolioCurrentIndex(index);
                  }}
                />

                {/* Image Counter */}
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {portfolioCurrentIndex + 1} / {clippr.images.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  ratingInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
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
  submitButtonDisabled: {
    backgroundColor: "#999",
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  reviewHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 10,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 8,
  },
  editActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  deleteActionButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
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
    borderRadius: 45,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 10,
    overflow: "hidden",
  },
  defaultProfileIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullProfileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 100,
    padding: 10,
  },
  profileCloseButton: {
    position: "absolute",
    top: -50,
    right: 0,
    zIndex: 100,
    padding: 10,
  },
  portfolioCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 100,
    padding: 10,
  },
  noImagesPlaceholder: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  noImagesText: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 12,
  },
  portfolioModalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  portfolioSlideContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioFullImage: {
    width: "100%",
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
