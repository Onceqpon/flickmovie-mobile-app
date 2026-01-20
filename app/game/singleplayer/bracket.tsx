import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { fetchMoviesForGame } from "@/services/tmdbapi";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BracketGame() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const rawGenres = params.genres as string;
  const rawProviders = params.providers as string;
  const rawType = params.type as string;
  const rawMinYear = params.minYear as string;
  const rawMaxYear = params.maxYear as string;
  const rawMinRating = params.minRating as string;

  const [loading, setLoading] = useState(true);
  
  const [currentRoundMovies, setCurrentRoundMovies] = useState<any[]>([]);
  const [nextRoundMovies, setNextRoundMovies] = useState<any[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [roundName, setRoundName] = useState("Round of 16");

  useEffect(() => {
    const initBracket = async () => {
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
        
        let bracketPool = data.slice(0, 16);
        
        if (bracketPool.length < 16 && bracketPool.length >= 8) bracketPool = bracketPool.slice(0, 8);
        else if (bracketPool.length < 8 && bracketPool.length >= 4) bracketPool = bracketPool.slice(0, 4);
        
        setCurrentRoundMovies(bracketPool);
        updateRoundName(bracketPool.length);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    initBracket();
  }, [rawGenres, rawProviders, rawType, rawMinYear, rawMaxYear, rawMinRating]);

  const updateRoundName = (count: number) => {
      if (count === 16) setRoundName("Round of 16");
      else if (count === 8) setRoundName("Quarterfinals");
      else if (count === 4) setRoundName("Semifinals");
      else if (count === 2) setRoundName("The Final 🏆");
  };

  const handlePick = (winner: any) => {
      const newNextRound = [...nextRoundMovies, winner];
      setNextRoundMovies(newNextRound);

      const isLastPair = (currentPairIndex + 1) * 2 >= currentRoundMovies.length;

      if (isLastPair) {
          if (newNextRound.length === 1) {
              finishGame(newNextRound[0]);
          } else {
              setCurrentRoundMovies(newNextRound);
              setNextRoundMovies([]);
              setCurrentPairIndex(0);
              updateRoundName(newNextRound.length);
          }
      } else {
          setCurrentPairIndex(prev => prev + 1);
      }
  };

  const handleUndo = () => {
      if (currentPairIndex > 0) {
          setNextRoundMovies(prev => prev.slice(0, -1));
          setCurrentPairIndex(prev => prev - 1);
      }
  };

  const finishGame = (winner: any) => {
    const resultFormat = [{
        id: winner.id,
        title: winner.title,
        poster_path: winner.poster_path,
        vote_average: winner.vote_average,
        release_date: winner.release_date,
        media_type: winner.media_type,
        match_score: 100 
    }];

    router.replace({
      pathname: "/game/singleplayer/results",
      params: { results: JSON.stringify(resultFormat) }
    });
  };

  const handleExit = () => {
    Alert.alert(
        "Quit Tournament?",
        "Your current progress will be lost.",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Quit", style: "destructive", onPress: () => router.push('/game' as any) }
        ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FF9C01" />
        <Text className="text-white mt-4 font-bold">Building Bracket...</Text>
      </View>
    );
  }

  const movieA = currentRoundMovies[currentPairIndex * 2];
  const movieB = currentRoundMovies[currentPairIndex * 2 + 1];

  if (!movieA || !movieB) return null;

  return (
    <View className="flex-1 bg-primary">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1">
            
            <View className="flex-row items-center justify-between px-4 mt-2 mb-4">
                <TouchableOpacity 
                    onPress={handleExit} 
                    className="p-2 bg-white/10 rounded-full border border-white/5"
                >
                    <Image source={icons.close} className="w-5 h-5" tintColor="white" />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="text-secondary font-black text-2xl uppercase tracking-widest">
                        {roundName}
                    </Text>
                    <Text className="text-gray-400 text-xs font-bold">
                        Match {currentPairIndex + 1} / {currentRoundMovies.length / 2}
                    </Text>
                </View>

                <View className="w-9 items-end">
                    {currentPairIndex > 0 && (
                        <TouchableOpacity 
                            onPress={handleUndo} 
                            className="p-2 bg-white/10 rounded-full border border-white/5"
                        >
                            <Image source={icons.left_arrow} className="w-5 h-5" tintColor="#FF9C01" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View className="flex-1 justify-center items-center px-4 gap-4 pb-4">
                
                <Animated.View 
                    key={`A-${movieA.id}`}
                    entering={FadeIn.duration(400)} 
                    exiting={FadeOut.duration(200)}
                    className="w-full flex-1"
                >
                    <TouchableOpacity 
                        activeOpacity={0.9}
                        onPress={() => handlePick(movieA)}
                        className="flex-1 w-full relative rounded-3xl overflow-hidden border-2 border-transparent active:border-secondary"
                    >
                        <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/w780${movieA.poster_path}` }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                            className="absolute bottom-0 w-full p-4 justify-end"
                        >
                            <Text className="text-white font-bold text-2xl shadow-black" numberOfLines={1}>{movieA.title}</Text>
                            <Text className="text-gray-300 text-xs my-1 leading-4" numberOfLines={2}>{movieA.overview}</Text>
                            <Text className="text-secondary font-bold">⭐ {movieA.vote_average.toFixed(1)}</Text>
                        </LinearGradient>
                        
                        <View className="absolute top-0 right-0 bg-secondary/90 px-3 py-1 rounded-bl-xl">
                            <Text className="text-primary font-bold text-xs">PICK ME</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View className="z-20 -my-8 items-center justify-center">
                    <View className="bg-primary/80 p-1 rounded-full">
                        <View className="bg-secondary w-14 h-14 rounded-full items-center justify-center border-4 border-primary shadow-lg shadow-black">
                            <Text className="text-primary font-black text-xl italic">VS</Text>
                        </View>
                    </View>
                </View>

                <Animated.View 
                    key={`B-${movieB.id}`}
                    entering={FadeIn.duration(400).delay(100)} 
                    exiting={FadeOut.duration(200)}
                    className="w-full flex-1"
                >
                    <TouchableOpacity 
                        activeOpacity={0.9}
                        onPress={() => handlePick(movieB)}
                        className="flex-1 w-full relative rounded-3xl overflow-hidden border-2 border-transparent active:border-secondary"
                    >
                        <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/w780${movieB.poster_path}` }} 
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                            className="absolute bottom-0 w-full p-4 justify-end"
                        >
                            <Text className="text-white font-bold text-2xl shadow-black" numberOfLines={1}>{movieB.title}</Text>
                            <Text className="text-gray-300 text-xs my-1 leading-4" numberOfLines={2}>{movieB.overview}</Text>
                            <Text className="text-secondary font-bold">⭐ {movieB.vote_average.toFixed(1)}</Text>
                        </LinearGradient>

                        <View className="absolute top-0 right-0 bg-secondary/90 px-3 py-1 rounded-bl-xl">
                            <Text className="text-primary font-bold text-xs">PICK ME</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </SafeAreaView>
    </View>
  );
}