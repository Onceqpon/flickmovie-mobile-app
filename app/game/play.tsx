import { icons } from "@/constants/icons";
import { fetchMoviesForGame } from "@/services/tmdbapi";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Wymiary karty
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
const CARD_WIDTH = SCREEN_WIDTH * 0.95;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function GamePlay() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMovies, setLikedMovies] = useState<any[]>([]);
  
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const translateX = useSharedValue(0);

  const finishGame = (results: any[]) => {
    const minifiedResults = results.map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        release_date: m.release_date
    }));

    router.replace({
      pathname: "/game/results",
      params: { results: JSON.stringify(minifiedResults) }
    } as any);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const genres = params.genres ? JSON.parse(params.genres as string) : [];
        const providers = params.providers ? JSON.parse(params.providers as string) : [];
        
        const data = await fetchMoviesForGame({
          genreIds: genres,
          providerIds: providers
        });
        
        setMovies(data.slice(0, 15));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [params.genres, params.providers]);

  const nextCard = () => {
    translateX.value = 0;
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsProcessing(false), 300);
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const currentMovie = movies[currentIndex];
    let newLikedMovies = [...likedMovies];

    if (direction === 'right') {
      newLikedMovies.push(currentMovie);
      setLikedMovies(newLikedMovies);
    }

    if (currentIndex >= movies.length - 1) {
      finishGame(newLikedMovies);
    } else {
      nextCard();
    }
  };

  // --- GESTY KARTY ---
  const cardGesture = Gesture.Pan()
    .enabled(!isProcessing && !isDetailVisible) 
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD || event.velocityX > 800) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)('right');
      } else if (event.translationX < -SWIPE_THRESHOLD || event.velocityX < -800) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)('left');
      } else {
        translateX.value = withSpring(0);
      }
    });

  // Funkcja pomocnicza do sterowania gestem z modala (po kliknięciu przycisku w szczegółach)
  const triggerSwipeFromModal = (direction: 'left' | 'right') => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Zamykamy modal
    setIsDetailVisible(false);

    // Czekamy chwilę aż modal zniknie i odpalamy animację swipe
    setTimeout(() => {
        const endPos = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
        translateX.value = withSpring(endPos, {}, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
    }, 200);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-10, 0, 10], Extrapolation.CLAMP)}deg` }
    ]
  }));

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FF9C01" />
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-6">
        <Text className="text-white text-center text-lg mb-4">Nie znaleziono filmów.</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-secondary px-6 py-3 rounded-xl">
           <Text className="font-bold">Zmień filtry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1]; 

  return (
    <SafeAreaView className="flex-1 bg-primary items-center justify-between py-2">
      
      {/* Licznik */}
      <View className="z-20 mt-2">
        <Text className="text-gray-400 font-bold opacity-80">
          {currentIndex + 1} / {movies.length}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center relative w-full my-4">
        {/* Karta Tła */}
        {nextMovie && (
          <View 
            className="absolute bg-black-200 rounded-3xl overflow-hidden opacity-40 border border-white/5"
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: [{ scale: 0.95 }], top: 15 }}
          >
             <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w780${nextMovie.poster_path}` }} 
                className="w-full h-full"
                resizeMode="cover"
             />
          </View>
        )}

        {/* Aktywna Karta */}
        {activeMovie ? (
          <GestureDetector gesture={cardGesture}>
            <Animated.View 
                style={[cardStyle, { width: CARD_WIDTH, height: CARD_HEIGHT }]} 
                className="bg-black-200 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 z-10"
            >
              <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w780${activeMovie.poster_path}` }}
                className="absolute w-full h-full"
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' }}
              />
              
              {/* Sekcja Info */}
              <TouchableOpacity 
                activeOpacity={1}
                onPress={() => setIsDetailVisible(true)} // Kliknięcie w info też otwiera
                className="absolute bottom-0 left-0 right-0 p-5 pb-8 flex-col justify-end h-[40%]"
              >
                    <Text className="text-white text-4xl font-extrabold mb-2 shadow-black" numberOfLines={2}>
                        {activeMovie.title}
                    </Text>
                    <View className="flex-row items-center gap-3 mb-2">
                        <View className="flex-row items-center bg-secondary px-2 py-0.5 rounded-md">
                            <Image source={icons.star} className="w-4 h-4 mr-1" tintColor="white" />
                            <Text className="text-white font-bold text-base">
                                {activeMovie.vote_average.toFixed(1)}
                            </Text>
                        </View>
                        <Text className="text-gray-300 text-lg font-medium">
                            {activeMovie.release_date?.split('-')[0]}
                        </Text>
                    </View>
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>
        ) : null}
      </View>

      {/* --- NOWY PRZYCISK: CHECK DETAILS --- */}
      {/* Zastępuje stare przyciski sterowania */}
      <View className="mb-8 z-20">
        <TouchableOpacity 
          onPress={() => setIsDetailVisible(true)}
          activeOpacity={0.8}
          className="flex-row items-center bg-black-200/80 px-8 py-4 rounded-full border border-white/20 backdrop-blur-md shadow-lg"
        >
          <Text className="text-white font-bold text-lg mr-2">Check Details</Text>
          {/* Strzałka w górę */}
          <Image source={icons.play} className="w-4 h-4 -rotate-90" tintColor="white" />
        </TouchableOpacity>
      </View>

      {/* --- MODAL ZE SZCZEGÓŁAMI --- */}
      {activeMovie && (
        <Modal
            visible={isDetailVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={() => setIsDetailVisible(false)}
        >
            <View className="flex-1 bg-primary">
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
                    {/* Wielkie Zdjęcie na górze */}
                    <View className="w-full h-[65vh] relative">
                         <Image 
                            source={{ uri: `https://image.tmdb.org/t/p/original${activeMovie.poster_path}` }}
                            className="w-full h-full"
                            resizeMode="cover"
                         />
                         <LinearGradient
                            colors={['transparent', '#000c1c']}
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 }}
                        />
                         {/* Przycisk powrotu na zdjęciu (Strzałka w dół) */}
                         <TouchableOpacity 
                            onPress={() => setIsDetailVisible(false)}
                            className="absolute top-12 right-6 w-10 h-10 bg-black/50 rounded-full justify-center items-center"
                         >
                            <Image source={icons.play} className="w-5 h-5 rotate-90" tintColor="white" />
                         </TouchableOpacity>
                    </View>

                    {/* Treść pod zdjęciem */}
                    <View className="px-5 -mt-6">
                        <Text className="text-white text-4xl font-extrabold mb-2">
                            {activeMovie.title}
                        </Text>
                        
                        <View className="flex-row items-center gap-4 mb-6">
                            <View className="flex-row items-center border border-secondary px-3 py-1 rounded-full">
                                <Image source={icons.star} className="w-4 h-4 mr-1" tintColor="#FF9C01" />
                                <Text className="text-white font-bold">
                                    {activeMovie.vote_average.toFixed(1)}
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-lg">
                                {activeMovie.release_date?.split('-')[0]}
                            </Text>
                        </View>

                        <Text className="text-secondary text-lg font-bold mb-2 uppercase tracking-wider">
                            O Filmie
                        </Text>
                        <Text className="text-gray-300 text-lg leading-8">
                            {activeMovie.overview || "Brak opisu dla tego filmu."}
                        </Text>
                    </View>
                </ScrollView>


            </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}