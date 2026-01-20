import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SwipeableMovieCard from "@/components/SwipeableMovieCard";
import { icons } from "@/constants/icons";
import { fetchMoviesForGame } from "@/services/tmdbapi";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;
const CARD_WIDTH = SCREEN_WIDTH * 0.90;

export default function GamePlay() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const rawGenres = params.genres as string;
  const rawProviders = params.providers as string;
  const rawType = params.type as string;
  const rawMinYear = params.minYear as string;
  const rawMaxYear = params.maxYear as string;
  const rawMinRating = params.minRating as string;

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMovies, setLikedMovies] = useState<any[]>([]);

  const finishGame = (results: any[]) => {
    const minifiedResults = results.map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        release_date: m.release_date,
        media_type: m.media_type 
    }));

    router.replace({
      pathname: "/game/singleplayer/results",
      params: { results: JSON.stringify(minifiedResults) }
    });
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const genres = rawGenres ? JSON.parse(rawGenres) : [];
        const providers = rawProviders ? JSON.parse(rawProviders) : [];
        const selectedType = (rawType as 'movie' | 'tv') || 'movie';
        
        const data = await fetchMoviesForGame({
          genreIds: genres,
          providerIds: providers,
          type: selectedType,
          minYear: rawMinYear,
          maxYear: rawMaxYear,
          minRating: rawMinRating
        });
        
        setMovies(data.slice(0, 15));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [rawGenres, rawProviders, rawType, rawMinYear, rawMaxYear, rawMinRating]);

  const handleSwipe = (liked: boolean) => {
    const currentMovie = movies[currentIndex];
    
    if (liked) {
      const newLikedMovies = [...likedMovies, currentMovie];
      setLikedMovies(newLikedMovies);
      
      if (currentIndex >= movies.length - 1) {
        finishGame(newLikedMovies);
        return;
      }
    } else {
        if (currentIndex >= movies.length - 1) {
            finishGame(likedMovies);
            return;
        }
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FF9C01" />
        <Text className="text-white mt-4 font-bold">Finding best matches...</Text>
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-6">
        <Text className="text-white text-center text-lg mb-4">No matching titles found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-secondary px-6 py-3 rounded-xl">
           <Text className="font-bold">Change Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1]; 

  return (
    <View className="flex-1 bg-primary">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1 flex-col">
            
            <View className="items-center mt-4">
                <View className="bg-white/5 px-4 py-1 rounded-full border border-white/10">
                    <Text className="text-gray-300 font-bold text-xs tracking-widest">
                        {currentIndex + 1} / {movies.length}
                    </Text>
                </View>
            </View>

            <View className="flex-1 items-center justify-center relative w-full">
                
                {nextMovie && (
                    <View 
                        className="absolute bg-black-200 rounded-3xl overflow-hidden opacity-40 border border-white/5"
                        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: [{ scale: 0.95 }], top: 20 }}
                    >
                        <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/w780${nextMovie.poster_path}` }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                )}

                {activeMovie ? (
                    <SwipeableMovieCard
                        key={currentIndex}
                        movie={activeMovie}
                        onSwipe={handleSwipe}
                        canLike={true}
                    />
                ) : null}
            </View>

            <View className="h-28 flex-row justify-center items-start gap-12 pt-1">
                <TouchableOpacity 
                    onPress={() => handleSwipe(false)} 
                    activeOpacity={0.7} 
                    className="items-center justify-center p-4 bg-black/20 rounded-full border border-white/5"
                >
                    <Image 
                        source={icons.close} 
                        className="w-10 h-10" 
                        tintColor="#EF4444" 
                    />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleSwipe(true)} 
                    activeOpacity={0.7}
                    className="items-center justify-center p-4 bg-black/20 rounded-full border border-white/5"
                >
                    <Image 
                        source={icons.heart} 
                        className="w-10 h-10" 
                        tintColor="#22C55E" 
                    />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    </View>
  );
}