import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';

type CardData = {
  name: string;
  location?: string;
  images?: string[];
  rating?: number;
  profilePic?: string;
};

export default function App() {
  const data: CardData[] = [
    {
      name: "Firstname Lastname",
      location: "Beets Veenstra",
      images: ["https://picsum.photos/400/200?random=11",
      "https://picsum.photos/400/200?random=4",
      "https://picsum.photos/400/200?random=5"],
      rating: 4.5,
      profilePic: "https://picsum.photos/400/200?random=15",
    },
    {
      name: "Prototype 2",
      location: "Boer Bennink",
      images: ["https://picsum.photos/400/200?random=2",
      "https://picsum.photos/400/200?random=6"],
      rating: 3.8,
      profilePic: "https://picsum.photos/400/200?random=19",
    },
    {
      name: "Another Card",
      location: "Commons Dining Hall",
      images: ["https://picsum.photos/400/200?random=3",
      "https://picsum.photos/400/200?random=7",
      "https://picsum.photos/400/200?random=8",
      "https://picsum.photos/400/200?random=9"],
      rating: 5.0,
      profilePic: "https://picsum.photos/400/200?random=42",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <ScrollView>
        {data.map((item, index) => (
          <Card 
            key={index}
            name={item.name}
            location={item.location}
            images={item.images}
            rating = {item.rating}
            profilePic={item.profilePic}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
