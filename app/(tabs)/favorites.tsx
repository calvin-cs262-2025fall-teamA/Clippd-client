import { useFavorites } from "@/contexts/FavoritesContext";
import { useClippd } from "@/contexts/ClippdContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FavoritesCard from "../../components/FavoritesCard";

export default function Favorites() {
  const { favorites } = useFavorites();
  const { clippers } = useClippd();

  const favoritedItems = clippers.filter(item => favorites.includes(item.id));

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        {favoritedItems.length > 0 ? (
          favoritedItems.map((item) => (
            <FavoritesCard
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
    marginTop: -20,
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
