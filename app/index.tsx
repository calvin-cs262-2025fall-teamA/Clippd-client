import React from "react";
import {
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ListRenderItemInfo,
} from "react-native";
import { Stack } from "expo-router";

type Stylist = {
  id: string;
  name: string;
  location: string;
  avatar: string;
};

const MOCK_STYLISTS: Stylist[] = [
  {
    id: "1",
    name: "Marcus Reed",
    location: "Downtown Barber, Seattle",
    avatar:
      "https://www.insurebodywork.com/u/2023/10/06175128/Hairstylist-License-Image-2-min.jpg",
  },
  {
    id: "2",
    name: "Aisha Gomez",
    location: "Uptown Cuts, Portland",
    avatar:
      "https://www.evergreenbeauty.edu/wp-content/uploads/2013/02/hairstylist-in-salon.jpg",
  },
  {
    id: "3",
    name: "Ethan Park",
    location: "Elm Street Salon, Grand Rapids",
    avatar:
      "https://as2.ftcdn.net/jpg/06/10/51/33/1000_F_610513347_Qjqz5OOrrUqK02ilUoUyi2ScmMEDxMDm.jpg",
  },
  {
    id: "4",
    name: "Priya Singh",
    location: "Harbor Hair, Chicago",
    avatar:
      "https://davidpressleyschool.com/wp-content/uploads/2023/08/bigstock-hairstylist-trimming-hair-of-t-438871286-1.jpg",
  },
  {
    id: "5",
    name: "Liam O'Connor",
    location: "Great Clips, Grand Rapids",
    avatar:
      "https://cdn.prod.website-files.com/67336b2139b6b0905c503a6b/67a374a92551b83be5de76c3_barbershop-terminology-1.jpeg",
  },
];

export default function Index() {
  const renderItem = ({ item }: ListRenderItemInfo<Stylist>) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={MOCK_STYLISTS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#ddd",
  },
  info: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
    textAlign: "left",
  },
  location: {
    fontSize: 13,
    color: "#666",
    textAlign: "left",
  },
});
