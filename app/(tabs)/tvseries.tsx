import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

// ZMIANA 1: Importujemy fetchTVSeries
import { fetchTVSeries } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

// ZMIANA 2: Importujemy TVSeriesCard
import SearchBar from "@/components/SearchBar";
import TVSeriesCard from "@/components/TVSeriesCard";

// ZMIANA 3: Lista gatunków specyficzna dla TV (TMDB TV Genres)
const tvGenres = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

// Komponent sekcji dla jednego gatunku serialu
const GenreSection = ({ genre }: { genre: { id: number | null; name: string } }) => {
  // Pobieramy seriale dla danego gatunku
  const { data: series, loading, error } = useLoadData(
    () => fetchTVSeries({ query: "", genreId: genre.id }), 
    []
  );

  if (loading) {
    return (
      <View className="mt-10 h-52 justify-center">
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (error || !series || series.length === 0) {
    return null; 
  }

  return (
    <View className="mt-8">
      <Text className="text-lg text-white font-bold mb-3 ml-2">
        {genre.name}
      </Text>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={series}
        contentContainerStyle={{
          gap: 15,
          paddingHorizontal: 10, 
        }}
        renderItem={({ item }) => (
          // Używamy TVSeriesCard
          <TVSeriesCard {...item} className="w-[140px]" />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const TVSeries = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.mainbg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }}
      >
        <Image 
          source={icons.logo} 
          className="w-[250px] h-[100px] mt-10 mx-auto"
          resizeMode="contain" 
        />

        <View className="flex-1 mt-5">
          <SearchBar
            onPress={() => {
              router.push("/search/search");
            }}
            placeholder="Search for a TV series"
          />
          
          <View className="mt-5">
            {/* Generujemy sekcje na podstawie listy gatunków TV */}
            {tvGenres.map((genre) => (
              <GenreSection key={genre.name} genre={genre} />
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default TVSeries;