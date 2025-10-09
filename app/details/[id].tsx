import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";

export default function DetailsPage() {
  const { id } = useLocalSearchParams();
  const clippr: itemType | undefined = itemData.find((item) => item.id === id);

  if (!clippr) {
    return (
      <View style={styles.container}>
        <Text>Clippr not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={router.back}
              style={{ marginLeft: 15, marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => {}} style={{ marginRight: 15 }}>
              <Ionicons name="heart-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <Image source={{ uri: clippr.profilePic }} style={styles.headerImage} />
        <View style={styles.content}>
          <Text style={styles.name}>{clippr.name}</Text>
          <Text style={styles.location}>📍 {clippr.location}</Text>
          <Text style={styles.rating}>⭐ {clippr.rating}</Text>

          <Text style={styles.sectionTitle}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {clippr.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.portfolioImage}
              />
            ))}
          </ScrollView>
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
  headerImage: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  rating: {
    fontSize: 18,
    marginBottom: 20,
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
});
