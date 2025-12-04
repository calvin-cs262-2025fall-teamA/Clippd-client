import { useClippd } from "@/contexts/ClippdContext";
import { useAuth } from "@/contexts/AuthContext";
import { ClipperProfile } from "@/type/clippdTypes";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
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
  const [barberData, setBarberData] = useState<ClipperProfile | null>(null);
  const { clippers } = useClippd();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  useEffect(() => {
    // If logged-in user is a Barber, find their profile in clippers array
    // Otherwise, use the first barber from the API data
    if (clippers && clippers.length > 0) {
      if (user && user.role === "Clipper") {
        // Find barber with matching name
        const userBarber = clippers.find(
          (clipper) =>
            clipper.name === `${user.firstName} ${user.lastName}` ||
            clipper.name === user.firstName
        );
        if (userBarber) {
          setBarberData(userBarber);
          console.log("Logged-in barber data loaded:", userBarber);
          console.log("Barber services:", userBarber.services);
        } else {
          // Fallback to first barber if not found
          setBarberData(clippers[0]);
        }
      } else {
        // For regular clients, show first barber
        setBarberData(clippers[0]);
        console.log("First barber data loaded:", clippers[0]);
        console.log("First barber services:", clippers[0]?.services);
      }
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
        {/* Logout Button - Inside ScrollView */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

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
            {barberData.bio ||
              "Specializing in modern cuts and color techniques with 8+ years of experience. Passionate about helping clients look and feel their best."}
          </Text>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity>
              <Ionicons name="pencil" size={20} color="#000000ff" />
            </TouchableOpacity>
          </View>

          {barberData.services && barberData.services.length > 0 ? (
            <ScrollView
              style={styles.servicesScrollContainer}
              contentContainerStyle={styles.servicesContentContainer}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              {barberData.services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <Text style={styles.serviceName}>
                    {service.serviceName || "Service"}
                  </Text>
                  <View style={styles.serviceDetails}>
                    {service.durationMinutes && (
                      <View style={styles.serviceDetailItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.serviceDetailText}>
                          {service.durationMinutes < 60
                            ? `${service.durationMinutes}m`
                            : `${Math.floor(service.durationMinutes / 60)}h${
                                service.durationMinutes % 60 > 0
                                  ? ` ${service.durationMinutes % 60}m`
                                  : ""
                              }`}
                        </Text>
                      </View>
                    )}
                    {service.price !== undefined && service.price !== null && (
                      <View style={styles.serviceDetailItem}>
                        <Ionicons name="cash-outline" size={16} color="#666" />
                        <Text style={styles.serviceDetailText}>
                          $
                          {typeof service.price === "number"
                            ? service.price.toFixed(2)
                            : parseFloat(String(service.price)).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>No services available</Text>
          )}
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
    paddingTop: 0,
  },

  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "flex-end",
    marginTop: 40,
  },

  logoutButton: {
    backgroundColor: "#ff1a47",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
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

  /* Services Scroll Container */
  servicesScrollContainer: {
    maxHeight: 280,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  servicesContentContainer: {
    paddingTop: 8,
    paddingHorizontal: 0,
  },

  /* Service Cards */
  serviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
  logoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
});
