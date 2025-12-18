import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

import { fetchMovies } from "@/services/tmdbapi";
import useLoadData from "@/services/useloaddata";

import { images } from "@/constants/images";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];


const GenreSection = ({ genre }: { genre: { id: number | null; name: string } }) => {
  const { data: movies, loading, error } = useLoadData(
    () => fetchMovies({ query: "", genreId: genre.id }), 
    []
  );

  if (loading) {
    return (
      <View className="mt-10 h-52 justify-center">
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (error || !movies || movies.length === 0) {
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
        data={movies}
        contentContainerStyle={{
          gap: 15,
          paddingHorizontal: 10, 
        }}
        renderItem={({ item }) => (
          <MovieCard {...item} className="w-[140px]" />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const Index = () => {
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
        <Text className="text-5xl text-white font-black text-center tracking-wider mt-20 mb-5 ">
                FLICK<Text className="text-secondary">MOVIE</Text>
             </Text>

        <View className="flex-1 mt-5">
          <SearchBar
            onPress={() => {
              router.push("/search/search");
            }}
            placeholder="Search for a movie"
          />
          <View className="mt-5">
            {genres.map((genre) => (
              <GenreSection key={genre.name} genre={genre} />
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default Index;