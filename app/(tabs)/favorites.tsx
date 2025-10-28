import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function Favorites() {
  return (
    <>
      <Stack.Screen options={{ title: "Favorites" }} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Favorites</Text>
      </View>
    </>
  );
}
