// used from https://github.com/divanov11/react-native-appwrite/blob/2-protected-routes/app/signin.jsx

import { Href, router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const handleLogin = () => {
    router.replace("/(tabs)" as Href);
  };

  const handleSignup = () => {
    router.replace("signup" as Href);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headline}>SignIn</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={"gray"}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.signupText}>
        Don&apos;t have and account?
        <Pressable onPress={handleSignup}>
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
    marginTop: -100,
    marginBottom: 50,
    fontWeight: 700,
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
  link: {
    color: "#4285F4",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  signupText: {
    marginTop: 100,
    textAlign: "center",
  },
});
