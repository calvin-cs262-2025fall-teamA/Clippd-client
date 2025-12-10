import { Href, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Select Role");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (role === "Select Role") {
      Alert.alert("Error", "Please select a role");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signup(firstName, lastName, email, password, role);
      router.replace("/(tabs)" as Href);
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Unable to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Sign Up</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Role:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowRoleMenu(!showRoleMenu)}
          >
            <Text style={styles.dropdownText}>{role}</Text>
            <Ionicons
              name={showRoleMenu ? "chevron-up" : "chevron-down"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
          {showRoleMenu && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setRole("Client");
                  setShowRoleMenu(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>Client</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => {
                  setRole("Clipper");
                  setShowRoleMenu(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>Clipper</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>First Name:</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            placeholderTextColor="gray"
          />

          <Text style={styles.label}>Last Name:</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            placeholderTextColor="gray"
          />

          <Text style={styles.label}>Email:</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor={"gray"}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={"gray"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    minHeight: "100%",
  },
  headline: {
    textAlign: "center",
    marginTop: -100,
    marginBottom: 50,
    fontWeight: "700",
    fontStyle: "italic",
    fontSize: 72,
  },
  label: {
    marginLeft: "10%",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: "80%",
    marginTop: 10,
    marginBottom: 10,
    borderColor: "grey",
    alignSelf: "center",
  },
  formContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
    width: "80%",
    marginTop: 10,
    marginBottom: 10,
    paddingRight: 10,
    alignSelf: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  passwordToggle: {
    padding: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
    width: "80%",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignSelf: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "grey",
    width: "80%",
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
  },
});
