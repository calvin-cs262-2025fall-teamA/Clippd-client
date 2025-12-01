import { useClippd } from "@/contexts/ClippdContext";
import { useAuth } from "@/contexts/AuthContext";
import { itemType } from "@/type/clippdTypes";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function BarberProfile() {
  const [barberData, setBarberData] = useState<itemType | null>(null);
  const { clippers, isClippersLoading } = useClippd();
  const { user } = useAuth();

  useEffect(() => {
    // If logged-in user is a Barber, find their profile in clippers array
    // Otherwise, use the first barber from the API data
    if (clippers && clippers.length > 0) {
      if (user && user.role === "Clipper") {
        // Find barber with matching name
        const userBarber = clippers.find(
          (clipper) =>
            clipper.name === `${user.firstName} ${user.lastName}` ||
            clipper.firstName === user.firstName
        );
        if (userBarber) {
          setBarberData(userBarber);
          console.log("Logged-in barber data loaded:", userBarber);
        } else {
          // Fallback to first barber if not found
          setBarberData(clippers[0]);
        }
      } else {
        // For regular clients, show first barber
        setBarberData(clippers[0]);
        console.log("First barber data loaded:", clippers[0]);
      }
      console.log("Images:", clippers[0]?.images);
    }
  }, [clippers, user]);

  if (!barberData) {
    return null;
  }

  const totalReviews = barberData.reviews?.length || 0;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        style={styles.container}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>

          {/* Profile Image */}
          <Image
            source={{
              uri: barberData.profilePic,
            }}
            style={styles.profileImage}
          />

          {/* Name & Title */}
          <Text style={styles.name}>{barberData.name}</Text>
          <Text style={styles.title}>Professional Hair Stylist</Text>

          {/* Rating & Location */}
          <View style={styles.ratingLocationRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingText}>
                {formatRating(barberData.rating)} ({totalReviews} reviews)
              </Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={18} color="#666" />
              <Text style={styles.locationText}>{barberData.location}</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>
            Specializing in modern cuts and color techniques with 8+ years of
            experience. Passionate about helping clients look and feel their
            best.
          </Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>Haircut & Style</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>1h</Text>
              </View>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>$45</Text>
              </View>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>Beard Trim</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>30m</Text>
              </View>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>$25</Text>
              </View>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>Color Treatment</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>2h</Text>
              </View>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>$120</Text>
              </View>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>Blowout</Text>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>45m</Text>
              </View>
              <View style={styles.serviceDetailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.serviceDetailText}>$35</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.portfolioGrid}>
            {barberData.images && barberData.images.length > 0 ? (
              barberData.images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.portfolioImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Text>No images available</Text>
            )}
            {barberData.images && barberData.images.length < 6 && (
              <View style={styles.portfolioImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>

          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Appointments</Text>
                <Text style={styles.statValue}>1,248</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Repeat Clients</Text>
                <Text style={styles.statValue}>78%</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Rating</Text>
                <Text style={styles.statValue}>{formatRating(barberData.rating)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Response Time</Text>
                <Text style={styles.statValue}>{"< 1h"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 60,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  ratingLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  bio: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
  },

  /* Section */
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  /* Service Cards */
  serviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 16,
  },
  serviceDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  serviceDetailText: {
    fontSize: 14,
    color: "#666",
  },

  /* Portfolio Grid */
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  portfolioImage: {
    width: "31%",
    height: 120,
    borderRadius: 12,
  },
  portfolioImagePlaceholder: {
    width: "31%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },

  /* Statistics Card */
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },
});
