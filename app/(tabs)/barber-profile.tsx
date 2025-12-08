import { useClippd } from "@/contexts/ClippdContext";
import { useAuth } from "@/contexts/AuthContext";
import { ClipperProfile, Service } from "@/type/clippdTypes";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { getApiUrl } from "@/utils/networkConfig";

// US States and Major Cities
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const CITIES_BY_STATE: { [key: string]: string[] } = {
  "Alabama": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa"],
  "Alaska": ["Anchorage", "Juneau", "Fairbanks", "Sitka", "Ketchikan"],
  "Arizona": ["Phoenix", "Mesa", "Scottsdale", "Chandler", "Tempe"],
  "Arkansas": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
  "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Pueblo"],
  "Connecticut": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury"],
  "Delaware": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg"],
  "Georgia": ["Atlanta", "Augusta", "Savannah", "Athens", "Macon"],
  "Hawaii": ["Honolulu", "Hilo", "Kailua", "Kaneohe", "Waipahu"],
  "Idaho": ["Boise", "Nampa", "Meridian", "Idaho Falls", "Pocatello"],
  "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville"],
  "Indiana": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Bloomington"],
  "Iowa": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
  "Kansas": ["Kansas City", "Wichita", "Topeka", "Overland Park", "Lawrence"],
  "Kentucky": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
  "Louisiana": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
  "Maine": ["Portland", "Lewiston", "Bangor", "Augusta", "Waterville"],
  "Maryland": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie"],
  "Massachusetts": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge"],
  "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],
  "Minnesota": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington"],
  "Mississippi": ["Jackson", "Gulfport", "Southhaven", "Hattiesburg", "Biloxi"],
  "Missouri": ["Kansas City", "St. Louis", "Springfield", "Independence", "Columbia"],
  "Montana": ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena"],
  "Nebraska": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  "Nevada": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Rochester"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton"],
  "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
  "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
  "North Dakota": ["Bismarck", "Fargo", "Grand Forks", "Minot", "Williston"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  "Oklahoma": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"],
  "Oregon": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "Woonsocket"],
  "South Carolina": ["Charleston", "Columbia", "Greenville", "Summerville", "Goose Creek"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
  "Tennessee": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
  "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"],
  "Utah": ["Salt Lake City", "Provo", "Ogden", "Sandy", "Orem"],
  "Vermont": ["Burlington", "Rutland", "South Burlington", "Montpelier", "Barre"],
  "Virginia": ["Virginia Beach", "Richmond", "Arlington", "Alexandria", "Roanoke"],
  "Washington": ["Seattle", "Tacoma", "Vancouver", "Spokane", "Bellevue"],
  "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Wheeling", "Weirton"],
  "Wisconsin": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  "Wyoming": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"],
};

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

// Service Categories Data
const SERVICE_CATEGORIES = [
  {
    label: "Haircuts",
    values: ["Fade", "Taper", "Scissor Cut", "Layer cut", "Bob/Long Bob", "Buzz Cut", "Trim & Shape up"]
  },
  {
    label: "Styling",
    values: ["Blowout", "Curling/Waves", "Straightening", "Special Event Hairstyle"]
  },
  {
    label: "Coloring",
    values: ["Full Color", "Highlights", "Balayage", "Root Touch-up", "Bleach + Tone"]
  },
  {
    label: "Treatments",
    values: ["Perm", "Keratin", "Relaxer"]
  },
  {
    label: "Facial / Beard Care",
    values: ["Beard Trim", "Beard Shaping", "Hot Towel Shave"]
  }
];

export default function BarberProfile() {
  const [barberData, setBarberData] = useState<ClipperProfile | null>(null);
  const { clippers, updateClipperProfile } = useClippd();
  const { user, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPortfolioModalVisible, setIsPortfolioModalVisible] = useState(false);
  const [isServicesModalVisible, setIsServicesModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [editData, setEditData] = useState({
    profilePic: "",
    firstName: "",
    lastName: "",
    bio: "",
    city: "",
    state: "",
    images: [] as string[],
  });
  const [editServices, setEditServices] = useState<{
    id?: number;
    serviceName: string;
    price: string;
    durationMinutes?: number;
  }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isBioFocused, setIsBioFocused] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPortfolioMenu, setShowPortfolioMenu] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Initialize API URL
  useEffect(() => {
    const initializeUrl = async () => {
      try {
        const url = await getApiUrl();
        setBaseUrl(url);
      } catch (error) {
        console.error("Failed to detect API URL:", error);
      }
    };
    initializeUrl();
  }, []);

  useEffect(() => {
    // If logged-in user is a Barber, find their profile in clippers array
    // Otherwise, use the first barber from the API data
    if (clippers && clippers.length > 0) {
      let selectedBarber: ClipperProfile | null = null;

      if (user && user.role === "Clipper") {
        // Find barber with matching user ID or name
        selectedBarber = clippers.find((clipper) => {
          // Try to match by name (firstName + lastName)
          const clipperFullName = clipper.name || "";
          const userFullName = `${user.firstName} ${user.lastName}`;
          return (
            clipperFullName === userFullName ||
            clipperFullName === user.firstName ||
            clipperFullName.includes(user.firstName)
          );
        }) || null;

        if (!selectedBarber) {
          // If no match found, show first barber
          console.log("Barber not found in clippers array. User:", user);
          console.log("Clippers available:", clippers);
          selectedBarber = clippers[0];
        }
      } else {
        // For regular clients, show first barber
        selectedBarber = clippers[0];
      }

      if (selectedBarber) {
        // Set barber data (services are already loaded from ClippdContext)
        setBarberData(selectedBarber);
        const [city, state] = selectedBarber.location
          ? selectedBarber.location.split(", ")
          : ["", ""];
        const nameParts = selectedBarber.name?.split(" ") || [];
        setEditData({
          profilePic: selectedBarber.profilePic || "",
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          bio: selectedBarber.bio || "",
          city: city || "",
          state: state || "",
          images: selectedBarber.images || [],
        });
        console.log("Barber data loaded:", selectedBarber);
        console.log("Barber services:", selectedBarber.services);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clippers, user]);

  const handleEditPress = () => {
    // Initialize editData with current barberData values
    if (barberData) {
      const [firstName, lastName] = barberData.name.split(" ");
      const [city, state] = barberData.location.split(", ");
      
      setEditData({
        profilePic: barberData.profilePic || "",
        firstName: firstName || "",
        lastName: lastName || "",
        bio: barberData.bio || "",
        city: city || "",
        state: state || "",
        images: barberData.images || [],
      });
    }
    setIsEditModalVisible(true);
  };

  const handlePortfolioEditPress = () => {
    // Initialize editData with current barberData values
    if (barberData) {
      const [firstName, lastName] = barberData.name.split(" ");
      const [city, state] = barberData.location.split(", ");
      
      setEditData({
        profilePic: barberData.profilePic || "",
        firstName: firstName || "",
        lastName: lastName || "",
        bio: barberData.bio || "",
        city: city || "",
        state: state || "",
        images: barberData.images || [],
      });
    }
    setIsPortfolioModalVisible(true);
  };

  const handleServicesEditPress = () => {
    if (barberData && barberData.services && Array.isArray(barberData.services)) {
      const validServices = barberData.services
        .filter((service) => service && service.serviceName)
        .map((service) => ({
          id: service.id,
          serviceName: String(service.serviceName || "").trim(),
          price: service.price ? String(service.price) : "",
          durationMinutes: service.durationMinutes ?? undefined,
        }));
      setEditServices(validServices);
      console.log("Loaded services for editing:", validServices);
    } else {
      setEditServices([]);
      console.log("No services to load");
    }
    setSelectedCategory(null);
    setEditingServiceIndex(null);
    setIsServicesModalVisible(true);
  };

  const handleDeleteService = (index: number) => {
    setEditServices(editServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const newServices = [...editServices];
    newServices[index] = {
      ...newServices[index],
      [field]: value,
    };
    setEditServices(newServices);
  };

  // LOCAL TEST MODE: Set to true to only save images locally (won't persist after app restart)
  const LOCAL_TEST_MODE = true;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        if (LOCAL_TEST_MODE) {
          // In test mode, just store the URI directly (won't persist after restart)
          setEditData({
            ...editData,
            profilePic: result.assets[0].uri,
          });
        } else {
          // In production mode, convert image to base64 for persistence
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: "base64",
          });
          const imageData = `data:image/jpeg;base64,${base64}`;
          
          setEditData({
            ...editData,
            profilePic: imageData,
          });
        }
      } catch (error) {
        console.error("Error converting image to base64:", error);
        Alert.alert("Error", "Failed to process image");
      }
    }
    setShowImageMenu(false);
  };

  const handleDeleteProfilePic = () => {
    setEditData({
      ...editData,
      profilePic: "",
    });
    setShowImageMenu(false);
  };

  const pickPortfolioImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0].uri) {
      try {
        if (LOCAL_TEST_MODE) {
          // In test mode, just store the URI directly (won't persist after restart)
          setEditData({
            ...editData,
            images: [result.assets[0].uri, ...(editData.images || [])],
          });
        } else {
          // In production mode, convert image to base64 for persistence
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: "base64",
          });
          const imageData = `data:image/jpeg;base64,${base64}`;
          
          setEditData({
            ...editData,
            images: [imageData, ...(editData.images || [])],
          });
        }
        setShowPortfolioMenu(null);
      } catch (error) {
        console.error("Error processing image:", error);
        Alert.alert("Error", "Failed to process image");
      }
    }
  };

  const handleDeletePortfolioImage = (index: number) => {
    const newImages = editData.images?.filter((_, i) => i !== index) || [];
    setEditData({
      ...editData,
      images: newImages,
    });
    setShowPortfolioMenu(null);
  };

  const handleSaveChanges = async () => {
    if (!user || user.role !== "Clipper") {
      Alert.alert("Error", "Only clippers can edit their profile");
      return;
    }

    if (!editData.firstName.trim() || !editData.bio.trim() || !editData.city || !editData.state) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Determine if image was explicitly deleted or changed
      // If editData.profilePic is empty string, it means user deleted it
      // If editData.profilePic is a URI, use the new image
      // If editData.profilePic wasn't touched (same as barberData), don't update
      let imageUrl = editData.profilePic;

      const updatePayload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        bio: editData.bio,
        address: `${editData.city}, ${editData.state}`,
        city: editData.city,
        state: editData.state,
        profileImage: imageUrl, // Send empty string if deleted, new URI if changed, or existing URL
      };

      console.log("Updating profile with:", updatePayload);
      console.log("API URL:", `${baseUrl}/users/${user.id}`);

      const response = await fetch(`${baseUrl}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const responseText = await response.text();
      console.log("API Response Status:", response.status);
      console.log("API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      // Update local state with the new image URL
      if (barberData) {
        const updatedData = {
          ...barberData,
          profilePic: imageUrl, // Use the new image URL (local or URL)
          name: `${editData.firstName} ${editData.lastName}`,
          bio: editData.bio,
          location: `${editData.city}, ${editData.state}`,
          images: editData.images, // Update portfolio images
        };
        setBarberData(updatedData);
        
        // Update global context so changes reflect across the app
        updateClipperProfile(barberData.id, updatedData);
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditModalVisible(false);
      setIsPortfolioModalVisible(false);
      // Reset editData
      setEditData({
        profilePic: "",
        firstName: "",
        lastName: "",
        bio: "",
        city: "",
        state: "",
        images: [],
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveServices = async () => {
    if (!user || user.role !== "Clipper" || !barberData) {
      Alert.alert("Error", "Only clippers can edit their services");
      return;
    }

    // Validate services before saving
    const validServices = editServices.filter(service => {
      if (!service.serviceName || !String(service.serviceName).trim()) {
        console.warn("Skipping service without name");
        return false;
      }
      if (!service.price || isNaN(parseFloat(String(service.price)))) {
        console.warn("Skipping service without valid price");
        return false;
      }
      return true;
    });

    if (validServices.length === 0) {
      Alert.alert("Validation Error", "Please add at least one service with a name and price");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating services for clipper:", barberData.id);
      console.log("Valid services to save:", validServices);

      // First, delete all existing services for this clipper
      if (barberData.services && barberData.services.length > 0) {
        for (const service of barberData.services) {
          if (service.id) {
            try {
              const deleteResponse = await fetch(`${baseUrl}/services/${service.id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!deleteResponse.ok) {
                console.warn(`Failed to delete service ${service.id}`);
              }
            } catch (deleteErr) {
              console.warn(`Error deleting service ${service.id}:`, deleteErr);
            }
          }
        }
      }

      // Then, add all new services with proper validation
      const addedServices: Service[] = [];
      for (const service of validServices) {
        try {
          const serviceName = String(service.serviceName || "").trim();
          const price = parseFloat(String(service.price || "0"));
          const durationMinutes = service.durationMinutes || 0;

          if (!serviceName) {
            console.warn("Skipping service with empty name");
            continue;
          }

          if (isNaN(price) || price < 0) {
            console.warn("Skipping service with invalid price:", price);
            continue;
          }

          const addResponse = await fetch(`${baseUrl}/clippers/${barberData.id}/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              serviceName: serviceName,
              price: price,
              durationMinutes: durationMinutes,
            }),
          });

          if (!addResponse.ok) {
            const errorText = await addResponse.text();
            console.error(`Failed to add service: ${errorText}`);
            throw new Error(`Failed to add service: ${errorText}`);
          }

          const addedService = await addResponse.json();
          console.log("Service added successfully:", addedService);
          addedServices.push(addedService);
        } catch (addErr) {
          console.error("Error adding service:", addErr);
          throw addErr;
        }
      }

      // Fetch the updated clipper data from server to get latest services
      try {
        const servicesResponse = await fetch(
          `${baseUrl}/clippers/${barberData.id}/services`
        );
        if (servicesResponse.ok) {
          const rawServices = await servicesResponse.json();
          const services = (rawServices || [])
            .filter((s: any) => s.serviceName || s.servicename) // Filter out invalid services
            .map((s: any) => ({
              id: s.id,
              clipperID: s.clipperID || s.clipperid,
              serviceName: s.serviceName || s.servicename || "",
              price: s.price || 0,
              durationMinutes: s.durationMinutes || s.durationminutes || 0,
            }));
          console.log("Fetched and normalized services:", services);

          // Update local state with fetched data
          const updatedData = {
            ...barberData,
            services: services,
          };
          setBarberData(updatedData);
          updateClipperProfile(barberData.id, updatedData);
        }
      } catch (fetchErr) {
        console.error("Failed to fetch updated services:", fetchErr);
        // Don't throw here, services might be saved even if fetch fails
      }

      Alert.alert("Success", "Services updated successfully");
      setIsServicesModalVisible(false);
      setEditServices([]);
      setSelectedCategory(null);
      setEditingServiceIndex(null);
    } catch (error) {
      console.error("Error updating services:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update services: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!barberData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, fontSize: 14, color: '#666' }}>Loading barber profile...</Text>
      </View>
    );
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
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>

          {/* Profile Image */}
          {barberData.profilePic ? (
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: barberData.profilePic,
                }}
                style={styles.profileImage}
              />
            </View>
          ) : (
            <View style={styles.defaultProfileIcon}>
              <Ionicons name="person" size={50} color="#999" />
            </View>
          )}

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
            <TouchableOpacity onPress={handleServicesEditPress}>
              <Ionicons name="pencil" size={20} color="#000000ff" />
            </TouchableOpacity>
          </View>

          {barberData.services && Array.isArray(barberData.services) && barberData.services.length > 0 ? (
            <ScrollView
              style={styles.servicesScrollContainer}
              contentContainerStyle={styles.servicesContentContainer}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              <View>
                {barberData.services
                  .filter((service) => {
                    // Only show services with valid serviceName
                    return (
                      service &&
                      service.serviceName &&
                      String(service.serviceName).trim().length > 0
                    );
                  })
                  .map((service, idx) => {
                    // Ensure all required fields exist and are valid
                    const validService = {
                      ...service,
                      serviceName:
                        String(service.serviceName || "").trim() || "Service",
                      price:
                        service.price !== undefined && service.price !== null
                          ? service.price
                          : 0,
                      durationMinutes: service.durationMinutes || 0,
                    };
                    return (
                      <View
                        key={service.id || `service-${idx}`}
                        style={styles.serviceCard}
                      >
                        <Text style={styles.serviceName}>
                          {validService.serviceName}
                        </Text>
                        <View style={styles.serviceDetails}>
                          {validService.durationMinutes > 0 && (
                            <View style={styles.serviceDetailItem}>
                              <Ionicons
                                name="time-outline"
                                size={16}
                                color="#666"
                              />
                              <Text style={styles.serviceDetailText}>
                                {validService.durationMinutes < 60
                                  ? `${validService.durationMinutes}m`
                                  : `${Math.floor(
                                      validService.durationMinutes / 60
                                    )}h${
                                      validService.durationMinutes % 60 > 0
                                        ? ` ${validService.durationMinutes % 60}m`
                                        : ""
                                    }`}
                              </Text>
                            </View>
                          )}
                          {validService.price > 0 && (
                            <View style={styles.serviceDetailItem}>
                              <Ionicons
                                name="cash-outline"
                                size={16}
                                color="#666"
                              />
                              <Text style={styles.serviceDetailText}>
                                {`$${
                                  typeof validService.price === "number"
                                    ? validService.price.toFixed(2)
                                    : parseFloat(
                                        String(validService.price)
                                      ).toFixed(2)
                                }`}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>No services available</Text>
          )}
        </View>

        {/* Portfolio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <TouchableOpacity onPress={handlePortfolioEditPress}>
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
              <View style={styles.noPortfolioContainer}>
                <Ionicons name="image-outline" size={60} color="#ccc" />
                <Text style={styles.noPortfolioText}>No images yet</Text>
              </View>
            )}
            {barberData.images && barberData.images.length < 9 && (
              <View style={styles.portfolioImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={
                isBioFocused || isFirstNameFocused || isLastNameFocused 
                  ? { paddingBottom: 300 } 
                  : { paddingBottom: 20 }
              }
            >
                {/* Profile Picture */}
                <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Profile Picture</Text>
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={() => setShowImageMenu(true)}
                  disabled={isLoading}
                >
                  {editData.profilePic ? (
                    <View style={styles.previewImageWrapper}>
                      <Image
                        source={{ uri: editData.profilePic }}
                        style={styles.previewImage}
                      />
                    </View>
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="person" size={40} color="#999" />
                      <Text style={styles.imagePickerText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Image Action Menu */}
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showImageMenu}
                  onRequestClose={() => setShowImageMenu(false)}
                >
                  <TouchableOpacity
                    style={styles.menuBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowImageMenu(false)}
                  >
                    <View style={styles.imageMenuContainer}>
                      <TouchableOpacity
                        style={styles.menuButton}
                        onPress={pickImage}
                      >
                        <Ionicons name="image-outline" size={24} color="#000000" />
                        <Text style={styles.menuButtonText}>Change</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.menuButton, styles.deleteMenuButton]}
                        onPress={handleDeleteProfilePic}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ff1a47" />
                        <Text style={styles.menuButtonText}>Delete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.menuCancelButton}
                        onPress={() => setShowImageMenu(false)}
                      >
                        <Text style={styles.menuCancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter first name"
                  value={editData.firstName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, firstName: text })
                  }
                  onFocus={() => setIsFirstNameFocused(true)}
                  onBlur={() => setIsFirstNameFocused(false)}
                  editable={!isLoading}
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter last name"
                  value={editData.lastName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, lastName: text })
                  }
                  onFocus={() => setIsLastNameFocused(true)}
                  onBlur={() => setIsLastNameFocused(false)}
                  editable={!isLoading}
                />
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, { minHeight: 100 }]}
                  placeholder="Enter your bio"
                  value={editData.bio}
                  onChangeText={(text) =>
                    setEditData({ ...editData, bio: text })
                  }
                  onFocus={() => setIsBioFocused(true)}
                  onBlur={() => setIsBioFocused(false)}
                  multiline
                  editable={!isLoading}
                />
              </View>

              {/* State and City */}
              <View style={styles.inputGroup}>
                <View style={styles.locationHeaderRow}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TouchableOpacity
                    style={styles.editLocationButton}
                    onPress={() => setIsEditingLocation(!isEditingLocation)}
                  >
                    <Text style={styles.editLocationButtonText}>
                      {isEditingLocation ? "Done" : "Change"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!isEditingLocation ? (
                  <View style={styles.currentLocationDisplay}>
                    <Text style={styles.currentLocationText}>
                      {editData.city && editData.state
                        ? `${editData.city}, ${editData.state}`
                        : "No location set"}
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* State Picker */}
                    <Text style={styles.subLabel}>State</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editData.state}
                        onValueChange={(value) =>
                          setEditData({ ...editData, state: value, city: "" })
                        }
                        enabled={!isLoading}
                      >
                        {US_STATES.map((state) => (
                          <Picker.Item key={state} label={state} value={state} />
                        ))}
                      </Picker>
                    </View>

                    {/* City Picker */}
                    <Text style={styles.subLabel}>City</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editData.city}
                        onValueChange={(value) =>
                          setEditData({ ...editData, city: value })
                        }
                        enabled={!isLoading && !!editData.state}
                      >
                        {editData.state &&
                          CITIES_BY_STATE[editData.state]?.map((city) => (
                            <Picker.Item key={city} label={city} value={city} />
                          ))}
                      </Picker>
                    </View>
                  </>
                )}
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveChanges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Portfolio Modal */}
      <Modal
        visible={isPortfolioModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPortfolioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Portfolio</Text>
              <TouchableOpacity onPress={() => setIsPortfolioModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Portfolio Images */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Portfolio Images</Text>
                <View style={styles.portfolioGrid}>
                  {editData.images && editData.images.length < 9 && (
                    <TouchableOpacity
                      style={styles.portfolioAddButton}
                      onPress={pickPortfolioImage}
                    >
                      <Ionicons name="add" size={40} color="#999" />
                      <Text style={styles.portfolioAddText}>Add Image</Text>
                    </TouchableOpacity>
                  )}
                  {editData.images && editData.images.map((img, index) => (
                    <View key={index} style={styles.portfolioImageWrapper}>
                      <Image
                        source={{ uri: img }}
                        style={styles.portfolioEditImage}
                      />
                      <TouchableOpacity
                        style={styles.portfolioDeleteButton}
                        onPress={() => handleDeletePortfolioImage(index)}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsPortfolioModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Services Modal */}
      <Modal
        visible={isServicesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsServicesModalVisible(false);
          setSelectedCategory(null);
          setEditingServiceIndex(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Services</Text>
              <TouchableOpacity onPress={() => {
                setIsServicesModalVisible(false);
                setSelectedCategory(null);
                setEditingServiceIndex(null);
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Current Services List */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Services</Text>
                
                {editServices.length === 0 ? (
                  <Text style={styles.emptyText}>No services added yet</Text>
                ) : (
                  <View>
                    {editServices.map((service, index) => {
                      // Safely handle service data  
                      const safeServiceName = String(service?.serviceName || "").trim() || "Unnamed Service";
                      const safePrice = String(service?.price || "0.00").trim() || "0.00";
                      return (
                      <View key={index} style={styles.serviceEntry}>
                        <View style={styles.serviceMainRow}>
                          <View style={styles.serviceInfoContainer}>
                            <Text style={styles.serviceNameText}>{safeServiceName}</Text>
                            <Text style={styles.servicePriceText}>{`$${safePrice}`}</Text>
                          </View>
                          <View style={styles.serviceActionButtons}>
                            <TouchableOpacity
                              style={styles.editServiceButton}
                              onPress={() => setEditingServiceIndex(index)}
                            >
                              <Ionicons name="pencil" size={18} color="#00A8E8" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteServiceButton}
                              onPress={() => handleDeleteService(index)}
                            >
                              <Ionicons name="trash" size={18} color="#ff1a47" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Category Selection Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Add or Edit Service</Text>
                
                {editingServiceIndex === null ? (
                  <Text style={styles.helperText}>Select a service to add or tap a service above to edit</Text>
                ) : (
                  <Text style={styles.editingLabel}>Editing: {String(editServices[editingServiceIndex]?.serviceName || "").trim() || "Service"}</Text>
                )}

                {/* Category Buttons */}
                <View style={styles.categoryButtonsContainer}>
                  {SERVICE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.label}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.label && styles.categoryButtonActive
                      ]}
                      onPress={() => setSelectedCategory(selectedCategory === category.label ? null : category.label)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        selectedCategory === category.label && styles.categoryButtonTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Service Items from Selected Category */}
                {selectedCategory && (
                  <View style={styles.serviceItemsContainer}>
                    {SERVICE_CATEGORIES.find(c => c.label === selectedCategory)?.values.map((serviceName) => (
                      <TouchableOpacity
                        key={serviceName}
                        style={styles.serviceSelectItem}
                        onPress={() => {
                          if (editingServiceIndex !== null) {
                            handleServiceChange(editingServiceIndex, 'serviceName', serviceName);
                          } else {
                            setEditServices([
                              ...editServices,
                              { serviceName, price: "", id: undefined }
                            ]);
                            setEditingServiceIndex(editServices.length);
                          }
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={20} color="#00A8E8" />
                        <Text style={styles.serviceSelectText}>{serviceName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Price Input for Editing */}
                {editingServiceIndex !== null && (
                  <View style={styles.priceEditContainer}>
                    <Text style={styles.priceEditLabel}>Price ($)</Text>
                    <View style={styles.priceInputRow}>
                      <TextInput
                        style={styles.priceEditInput}
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        value={editServices[editingServiceIndex]?.price || ""}
                        onChangeText={(value) => handleServiceChange(editingServiceIndex, 'price', value)}
                      />
                      <TouchableOpacity
                        style={styles.priceConfirmButton}
                        onPress={() => setEditingServiceIndex(null)}
                      >
                        <Ionicons name="checkmark-circle" size={28} color="#00A8E8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsServicesModalVisible(false);
                  setSelectedCategory(null);
                  setEditingServiceIndex(null);
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveServices}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: "hidden",
  },
  defaultProfileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
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
  portfolioImageWrapper: {
    width: "30%",
    aspectRatio: 1,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  portfolioEditImage: {
    width: "100%",
    height: "100%",
  },
  portfolioDeleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
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
  noPortfolioContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e8e8e8",
    borderStyle: "dashed",
  },
  noPortfolioText: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 12,
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

  /* Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: "95%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  previewImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
  },
  locationHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editLocationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ff1a47",
    borderRadius: 6,
  },
  editLocationButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  currentLocationDisplay: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  currentLocationText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#ff1a47",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    borderStyle: "dashed",
    overflow: "hidden",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  imagePickerPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: "#999",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  imageMenuContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    gap: 12,
  },
  deleteMenuButton: {
    marginBottom: 20,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  menuCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  menuCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  portfolioAddButton: {
    width: "30%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  portfolioAddText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  /* Services Styles */
  serviceEntry: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00A8E8",
  },
  serviceMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  serviceInfoContainer: {
    flex: 1,
  },
  serviceNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  servicePriceText: {
    fontSize: 14,
    color: "#00A8E8",
    fontWeight: "500",
  },
  serviceActionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editServiceButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#e3f2fd",
  },
  deleteServiceButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fee",
  },
  categoryButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  categoryButtonActive: {
    backgroundColor: "#00A8E8",
    borderColor: "#00A8E8",
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  serviceItemsContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  serviceSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  serviceSelectText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  priceEditContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  priceEditLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceEditInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  priceConfirmButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInputGroup: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 12,
  },
  editingLabel: {
    fontSize: 13,
    color: "#00A8E8",
    fontWeight: "500",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
  },
  picker: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    height: 40,
  },
  addServiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#00A8E8",
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  addServiceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00A8E8",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
});
