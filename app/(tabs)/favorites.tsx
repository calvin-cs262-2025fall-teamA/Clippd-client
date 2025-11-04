import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FavotitesCard from "../../components/FavoritesCard";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";

export default function Favorites() {
  // This is temporary data - you'll want to replace this with actual favorites data later
  const data: itemType[] = itemData;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {data.length > 0 ? (
          data.map((item) => (
            <FavotitesCard
              key={item.id}
              id={item.id}
              name={item.name}
              location={item.location}
              images={item.images}
              rating={item.rating}
              profilePic={item.profilePic}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No favorites added yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  scrollView: {
    flex: 1,
    marginTop: -20, // Reduces space between header and content
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
  },
});
