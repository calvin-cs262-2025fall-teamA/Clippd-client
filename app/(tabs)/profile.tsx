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

// Format phone number to (XXX) XXX-XXXX format
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  
  // If no digits, return empty string
  if (digits.length === 0) return "";
  
  // Format: (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

// Extract only digits from phone number
const extractPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Preference Categories
const PREFERENCE_CATEGORIES = [
  {
    label: "Haircut Styles",
    values: ["Fade", "Taper", "Scissor Cut", "Layer cut", "Buzz Cut", "Trim & Shape up"]
  },
  {
    label: "Beard Care",
    values: ["Beard Trim", "Beard Shaping", "Hot Towel Shave"]
  },
  {
    label: "Hair Care",
    values: ["Hair Treatment", "Scalp Care", "Conditioning"]
  },
  {
    label: "Styling",
    values: ["Blowout", "Curling/Waves", "Straightening"]
  }
];

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditContactModalVisible, setIsEditContactModalVisible] = useState(false);
  const [isEditPreferencesModalVisible, setIsEditPreferencesModalVisible] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [profilePic, setProfilePic] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [editData, setEditData] = useState({
    profilePic: "",
    firstName: "",
    lastName: "",
    city: "",
    state: "",
  });
  const [editContactData, setEditContactData] = useState({
    phoneNumber: "",
    email: "",
  });
  const [editPreferencesData, setEditPreferencesData] = useState<string[]>([]);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isPhoneNumberFocused, setIsPhoneNumberFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [newPreference, setNewPreference] = useState("");
  const [selectedPreferenceCategory, setSelectedPreferenceCategory] = useState<string | null>(null);

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
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setCity(user.city || "");
      setState(user.state || "");
      setPhoneNumber(user.phoneNumber || "");
      setEmail(user.email || "");
      setPreferences(user.preferences || ["Fade Cuts", "Beard Trim"]);
      console.log("[Profile] Loaded user profile:", {
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        city: user.city,
        state: user.state,
        phoneNumber: user.phoneNumber,
        email: user.email,
        preferences: user.preferences,
      });
    }
  }, [user, isLoading]);

  const handleEditPress = () => {
    if (user) {
      // Set default values: first state if state is empty, first city if city is empty
      const defaultState = !state || state.trim() === "" ? US_STATES[0] : state;
      const defaultCity = !city || city.trim() === "" 
        ? (CITIES_BY_STATE[defaultState] ? CITIES_BY_STATE[defaultState][0] : "")
        : city;

      setEditData({
        profilePic: profilePic,
        firstName: firstName || "",
        lastName: lastName || "",
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

  const handleEditContactPress = () => {
    setEditContactData({
      phoneNumber: formatPhoneNumber(phoneNumber || ""),
      email: email || "",
    });
    setIsEditContactModalVisible(true);
  };

  const handleSaveContactChanges = async () => {
    if (!editContactData.phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (!editContactData.email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editContactData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate phone number (should have at least 10 digits)
    const phoneDigits = extractPhoneNumber(editContactData.phoneNumber);
    if (phoneDigits.length < 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
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
        phoneNumber: phoneDigits,
        email: editContactData.email,
      };

      console.log("[handleSaveContactChanges] Updating contact info with:", updatePayload);
      console.log("[handleSaveContactChanges] API URL:", `${baseUrl}/auth/user/profile`);

      const response = await fetch(`${baseUrl}/auth/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });

      const responseText = await response.text();
      console.log("[handleSaveContactChanges] API Response Status:", response.status);
      console.log("[handleSaveContactChanges] API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      // Update local state immediately with the new data (store only digits)
      console.log("[handleSaveContactChanges] Updating local state");
      setPhoneNumber(phoneDigits);
      setEmail(editContactData.email);

      // Update SecureStore with new contact data
      if (user) {
        const updatedUser = {
          ...user,
          phoneNumber: phoneDigits,
          email: editContactData.email,
        };
        
        await SecureStore.setItemAsync("userData", JSON.stringify(updatedUser));
        console.log("[handleSaveContactChanges] Updated user data in SecureStore:", updatedUser);
      }

      Alert.alert("Success", "Contact information updated successfully");
      setIsEditContactModalVisible(false);
      
      // Reset editContactData
      setEditContactData({
        phoneNumber: "",
        email: "",
      });
    } catch (error) {
      console.error("[handleSaveContactChanges] Error updating contact info:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Failed to update contact info: ${errorMessage}`);
    } finally {
      setIsLoading2(false);
    }
  };

  const handleEditPreferencesPress = () => {
    setEditPreferencesData([...preferences]);
    setNewPreference("");
    setIsEditPreferencesModalVisible(true);
  };

  const handleAddPreference = (preferenceName: string) => {
    if (editPreferencesData.includes(preferenceName)) {
      Alert.alert("Error", "This preference already exists");
      return;
    }

    setEditPreferencesData([...editPreferencesData, preferenceName]);
  };

  const handleDeletePreference = (index: number) => {
    setEditPreferencesData(editPreferencesData.filter((_, i) => i !== index));
  };

  const handleSavePreferencesChanges = () => {
    if (editPreferencesData.length === 0) {
      Alert.alert("Error", "Please add at least one preference");
      return;
    }

    console.log("[handleSavePreferencesChanges] Saving preferences:", editPreferencesData);
    
    // Update local state
    setPreferences([...editPreferencesData]);

    // In a real app, you would save this to the server and SecureStore
    // For now, we're just updating local state
    Alert.alert("Success", "Preferences updated successfully");
    setIsEditPreferencesModalVisible(false);
    setEditPreferencesData([]);
    setSelectedPreferenceCategory(null);
  };

  const pickImage = async () => {
    console.log("[pickImage] Starting image picker...");
    
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
          setEditData({
            ...editData,
            profilePic: result.assets[0].uri,
          });
          console.log("[pickImage] Using local test mode - URI stored");
        } else {
          // In production mode, convert image to base64 for persistence
          try {
            const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
              encoding: "base64",
            });
            const imageData = `data:image/jpeg;base64,${base64}`;
            setEditData({
              ...editData,
              profilePic: imageData,
            });
            console.log("[pickImage] Production mode - base64 encoded and stored");
          } catch (error) {
            console.error("[pickImage] Error converting to base64:", error);
            Alert.alert("Error", "Failed to process image");
          }
        }
      } else {
        console.log("[pickImage] Image selection canceled");
      }
    } catch (error) {
      console.error("[pickImage] Error opening image picker:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
    
    // Close the menu after selection
    setShowImageMenu(false);
  };

  const handleDeleteProfilePic = () => {
    console.log("[handleDeleteProfilePic] Deleting profile picture");
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
      let imageUrl = editData.profilePic;

      const updatePayload = {
        userId: user.id,
        firstName: editData.firstName,
        lastName: editData.lastName,
        city: editData.city,
        state: editData.state,
        address: `${editData.city}, ${editData.state}`,
        profileImage: imageUrl, // Send the new or existing image
      };

      console.log("[handleSaveChanges] Updating customer profile with:", updatePayload);
      console.log("[handleSaveChanges] API URL:", `${baseUrl}/auth/user/profile`);

      const response = await fetch(`${baseUrl}/auth/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });

      const responseText = await response.text();
      console.log("[handleSaveChanges] API Response Status:", response.status);
      console.log("[handleSaveChanges] API Response:", responseText);

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${responseText}`);
      }

      // Update local state immediately with the new data
      console.log("[handleSaveChanges] Updating local state");
      setProfilePic(imageUrl);
      setFirstName(editData.firstName);
      setLastName(editData.lastName);
      setCity(editData.city);
      setState(editData.state);

      // Update SecureStore with new profile data
      if (user) {
        const updatedUser = {
          ...user,
          firstName: editData.firstName,
          lastName: editData.lastName,
          city: editData.city,
          state: editData.state,
          profileImage: imageUrl,
        };
        
        await SecureStore.setItemAsync("userData", JSON.stringify(updatedUser));
        console.log("[handleSaveChanges] Updated user data in SecureStore:", updatedUser);
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditModalVisible(false);
      setIsEditingLocation(false);
      
      // Reset editData
      setEditData({
        profilePic: "",
        firstName: "",
        lastName: "",
        city: "",
        state: "",
      });
    } catch (error) {
      console.error("[handleSaveChanges] Error updating profile:", error);
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
            {firstName && lastName ? `${firstName} ${lastName}` : "Guest User"}
          </Text>
          <Text style={styles.location}>{city || "City"}, {state || "State"}</Text>
        </View>

        {/* Card Row */}
        <View style={styles.cardContainer}>
          {/* Contact */}
          <View style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.fieldHeader}>Contact</Text>
              <TouchableOpacity onPress={handleEditContactPress}>
                <Ionicons name="pencil" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.field}>Phone: {phoneNumber ? formatPhoneNumber(phoneNumber) : "(555) 123-4567"}</Text>
            <Text style={styles.field}>
              Email: {email || (user ? user.email : "customer@email.com")}
            </Text>
          </View>

          {/* Preferences */}
          <View style={styles.preferencesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.fieldHeader}>Preferences</Text>
              <TouchableOpacity onPress={handleEditPreferencesPress}>
                <Ionicons name="pencil" size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipContainer}>
              {preferences.length > 0 ? (
                preferences.map((pref, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{pref}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noPreferencesText}>No preferences set</Text>
              )}
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
                isFirstNameFocused || isLastNameFocused 
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
                  disabled={isLoading2}
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
                  editable={!isLoading2}
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
                  editable={!isLoading2}
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
                        enabled={!isLoading2}
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
                        enabled={!isLoading2 && !!editData.state}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        visible={isEditContactModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditContactModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Contact</Text>
              <TouchableOpacity onPress={() => setIsEditContactModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={
                isPhoneNumberFocused || isEmailFocused 
                  ? { paddingBottom: 300 } 
                  : { paddingBottom: 20 }
              }
            >
              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  value={editContactData.phoneNumber}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    setEditContactData({ ...editContactData, phoneNumber: formatted });
                  }}
                  onFocus={() => setIsPhoneNumberFocused(true)}
                  onBlur={() => setIsPhoneNumberFocused(false)}
                  editable={!isLoading2}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email address"
                  value={editContactData.email}
                  onChangeText={(text) =>
                    setEditContactData({ ...editContactData, email: text })
                  }
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  editable={!isLoading2}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditContactModalVisible(false)}
                  disabled={isLoading2}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveContactChanges}
                  disabled={isLoading2}
                >
                  {isLoading2 ? (
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

      {/* Edit Preferences Modal */}
      <Modal
        visible={isEditPreferencesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsEditPreferencesModalVisible(false);
          setSelectedPreferenceCategory(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Preferences</Text>
              <TouchableOpacity onPress={() => {
                setIsEditPreferencesModalVisible(false);
                setSelectedPreferenceCategory(null);
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
              {/* Current Preferences List */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Preferences</Text>
                
                {editPreferencesData.length === 0 ? (
                  <Text style={styles.emptyText}>No preferences added yet</Text>
                ) : (
                  <View>
                    {editPreferencesData.map((pref, index) => (
                      <View key={index} style={styles.preferenceEntry}>
                        <View style={styles.preferenceMainRow}>
                          <View style={styles.preferenceInfoContainer}>
                            <Text style={styles.preferenceNameText}>{pref}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deletePreferenceButton}
                            onPress={() => handleDeletePreference(index)}
                          >
                            <Ionicons name="trash" size={18} color="#ff1a47" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Category Selection Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Add Preferences</Text>
                
                {/* Category Buttons */}
                <View style={styles.categoryButtonsContainer}>
                  {PREFERENCE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.label}
                      style={[
                        styles.categoryButton,
                        selectedPreferenceCategory === category.label && styles.categoryButtonActive
                      ]}
                      onPress={() => setSelectedPreferenceCategory(selectedPreferenceCategory === category.label ? null : category.label)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        selectedPreferenceCategory === category.label && styles.categoryButtonTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Preference Items from Selected Category */}
                {selectedPreferenceCategory && (
                  <View style={styles.preferenceItemsContainer}>
                    {PREFERENCE_CATEGORIES.find(c => c.label === selectedPreferenceCategory)?.values.map((preferenceName) => (
                      <TouchableOpacity
                        key={preferenceName}
                        style={styles.preferenceSelectItem}
                        onPress={() => handleAddPreference(preferenceName)}
                      >
                        <Ionicons name="add-circle-outline" size={20} color="#ff1a47" />
                        <Text style={styles.preferenceSelectText}>{preferenceName}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditPreferencesModalVisible(false);
                  setSelectedPreferenceCategory(null);
                }}
                disabled={isLoading2}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSavePreferencesChanges}
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
  noPreferencesText: {
    fontSize: 14,
    color: "#999",
  },
  preferenceEntry: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff1a47",
  },
  preferenceMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  preferenceInfoContainer: {
    flex: 1,
  },
  preferenceNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  deletePreferenceButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fee",
  },
  addPreferenceContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  addPreferenceButtonIcon: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff1a47",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
  },
  categoryButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryButtonActive: {
    backgroundColor: "#ff1a47",
    borderColor: "#ff1a47",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  preferenceItemsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  preferenceSelectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  preferenceSelectText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});

