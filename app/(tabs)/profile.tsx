import { Stack, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
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

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [profilePic, setProfilePic] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [editData, setEditData] = useState({
    profilePic: "",
    firstName: "",
    lastName: "",
    city: "",
    state: "",
  });
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // LOCAL TEST MODE: Set to true to only save images locally (won't persist after app restart)
  const LOCAL_TEST_MODE = true;

  // Initialize local profile data and API URL
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
    console.log("[Profile] User:", user);
    console.log("[Profile] Is Loading:", isLoading);

    // Load user's profile data from DB when user data is available
    if (user && !isLoading) {
      setProfilePic(user.profileImage || "");
      setCity(user.city || "");
      setState(user.state || "");
      console.log("[Profile] Loaded user profile:", {
        profileImage: user.profileImage,
        city: user.city,
        state: user.state,
      });
    }
  }, [user, isLoading]);

  const handleEditPress = () => {
    if (user) {
      // Set default values: first state if state is empty, first city if city is empty
      const defaultState = !user.state || user.state.trim() === "" ? US_STATES[0] : user.state;
      const defaultCity = !user.city || user.city.trim() === "" 
        ? (CITIES_BY_STATE[defaultState] ? CITIES_BY_STATE[defaultState][0] : "")
        : user.city;

      setEditData({
        profilePic: profilePic,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        city: defaultCity,
        state: defaultState,
      });
      setIsEditModalVisible(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const pickImage = async () => {
    console.log("[pickImage] Starting image picker...");
    console.log("[pickImage] Current editData:", editData);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("[pickImage] Result:", result);

      if (!result.canceled && result.assets[0]) {
        console.log("[pickImage] Image selected:", result.assets[0].uri);
        
        if (LOCAL_TEST_MODE) {
          // In test mode, just store the URI directly (won't persist after restart)
          console.log("[pickImage] Using local test mode - storing URI directly");
          setEditData((prevData) => ({
            ...prevData,
            profilePic: result.assets[0].uri,
          }));
        } else {
          // In production mode, convert image to base64 for persistence
          try {
            const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
              encoding: "base64",
            });
            const imageData = `data:image/jpeg;base64,${base64}`;
            setEditData((prevData) => ({
              ...prevData,
              profilePic: imageData,
            }));
          } catch (error) {
            console.error("[pickImage] Error processing image:", error);
            Alert.alert("Error", "Failed to process image");
          }
        }
      } else {
        console.log("[pickImage] Image selection canceled or no assets");
      }
    } catch (error) {
      console.error("[pickImage] Error:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
    
    // Close the menu after selection
    setShowImageMenu(false);
  };

  const handleDeleteProfilePic = () => {
    setEditData({
      ...editData,
      profilePic: "",
    });
    setShowImageMenu(false);
  };

  const handleSaveChanges = async () => {
    if (!editData.firstName.trim() || !editData.lastName.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!editData.city || !editData.state) {
      Alert.alert("Error", "Please select city and state");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setIsLoading2(true);
    try {
      const updatePayload = {
        userId: user.id,
        firstName: editData.firstName,
        lastName: editData.lastName,
        city: editData.city,
        state: editData.state,
        profileImage: editData.profilePic,
      };

      console.log("Updating customer profile with:", updatePayload);
      console.log("API URL:", `${baseUrl}/auth/user/profile`);

      const response = await fetch(`${baseUrl}/auth/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });

      const responseText = await response.text();
      console.log("API Response Status:", response.status);
      console.log("API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      // Parse response
      const responseData = JSON.parse(responseText);
      console.log("Parsed response data:", responseData);

      // Update local state with response data
      setProfilePic(editData.profilePic);
      setCity(editData.city);
      setState(editData.state);

      // Update AuthContext user and SecureStore
      if (user) {
        const updatedUser = {
          ...user,
          firstName: editData.firstName,
          lastName: editData.lastName,
          city: editData.city,
          state: editData.state,
          profileImage: editData.profilePic,
        };
        
        // Save updated user to SecureStore so it persists
        await SecureStore.setItemAsync("userData", JSON.stringify(updatedUser));
        
        console.log("Updated user data in SecureStore:", updatedUser);
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditModalVisible(false);
      setIsEditingLocation(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update profile: ${errorMessage}`);
    } finally {
      setIsLoading2(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container}>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Ionicons name="pencil" size={20} color="#333" />
          </TouchableOpacity>

          {/* Profile Image */}
          {profilePic ? (
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profilePic }}
                style={styles.profileImage}
              />
            </View>
          ) : (
            <View style={styles.defaultProfileIcon}>
              <Ionicons name="person" size={50} color="#999" />
            </View>
          )}

          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
          </Text>
          <Text style={styles.location}>{city || "City"}, {state || "State"}</Text>
        </View>

        {/* Card Row */}
        <View style={styles.cardContainer}>
          {/* Contact */}
          <View style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.fieldHeader}>Contact</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.field}>Phone: (555) 123-4567</Text>
            <Text style={styles.field}>
              Email: {user ? user.email : "customer@email.com"}
            </Text>
          </View>

          {/* Preferences */}
          <View style={styles.preferencesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.fieldHeader}>Preferences</Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipContainer}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Fade Cuts</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>Beard Trim</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
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
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* Profile Picture */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Profile Picture</Text>
                {editData.profilePic ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: editData.profilePic }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.imageChangeButton}
                      onPress={() => setShowImageMenu(true)}
                    >
                      <Ionicons name="pencil" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.imagePickerButton}
                    onPress={() => setShowImageMenu(true)}
                  >
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="image-outline" size={48} color="#999" />
                      <Text style={styles.imagePickerText}>Add Photo</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  value={editData.firstName}
                  onChangeText={(value) =>
                    setEditData({ ...editData, firstName: value })
                  }
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  value={editData.lastName}
                  onChangeText={(value) =>
                    setEditData({ ...editData, lastName: value })
                  }
                />
              </View>

              {/* Location - State and City */}
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
                ) : isEditModalVisible ? (
                  <>
                    {/* State Picker */}
                    <Text style={styles.subLabel}>State</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={editData.state}
                        onValueChange={(value) =>
                          setEditData({ ...editData, state: value, city: "" })
                        }
                        enabled={!isLoading2}
                      >
                        <Picker.Item label="Select a state" value="" />
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
                        enabled={!isLoading2 && !!editData.state}
                      >
                        <Picker.Item label="Select a city" value="" />
                        {editData.state &&
                          CITIES_BY_STATE[editData.state]?.map((city) => (
                            <Picker.Item key={city} label={city} value={city} />
                          ))}
                      </Picker>
                    </View>
                  </>
                ) : null}
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isLoading2}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={isLoading2}
              >
                {isLoading2 ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Image Menu Modal */}
      <Modal
        visible={showImageMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageMenu(false)}
      >
        <View style={styles.menuBackdrop}>
          <View style={styles.imageMenuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color="#000" />
              <Text style={styles.menuButtonText}>Choose Photo</Text>
            </TouchableOpacity>

            {editData.profilePic && (
              <TouchableOpacity
                style={[styles.menuButton, styles.deleteMenuButton]}
                onPress={handleDeleteProfilePic}
              >
                <Ionicons name="trash-outline" size={24} color="#ff1a47" />
                <Text style={[styles.menuButtonText, { color: "#ff1a47" }]}>
                  Delete Photo
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuCancelButton}
              onPress={() => setShowImageMenu(false)}
            >
              <Text style={styles.menuCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  },

  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#ff1a47",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 10,
  },
  logoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 100,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: "hidden",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  location: {
    fontSize: 14,
    color: "#666",
  },

  /* Cards */
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    padding: 15,
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  preferencesCard: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    padding: 15,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  /* Text */
  fieldHeader: {
    color: "#111",
    fontSize: 18,
    fontWeight: "600",
  },
  field: {
    color: "#333",
    fontSize: 14,
    marginBottom: 6,
  },

  /* Chips */
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#eaeaea",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 14,
    color: "#222",
  },

  /* Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "90%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
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
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  imagePreviewContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imageChangeButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#00A8E8",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#00A8E8",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 40,
    backgroundColor: "#fff",
  },
});
