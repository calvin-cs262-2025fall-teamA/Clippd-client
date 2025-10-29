import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../../components/Card";
import itemData from "../../data/item.json";
import { itemType } from "../../type/itemType";

// type CardData = {
//   name: string;
//   location?: string;
//   images?: string[];
//   rating?: number;
//   profilePic?: string;
// };

export default function App() {
  const data: itemType[] = itemData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
        {data.map((item) => (
          <Card
            id={item.id}
            key={item.id}
            name={item.name}
            location={item.location}
            images={item.images}
            rating={item.rating}
            profilePic={item.profilePic}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
