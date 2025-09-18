import { Text, View } from "react-native";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Clippd ✂️",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Clippd ✂️</Text>
      </View>
    </>
  );
}
