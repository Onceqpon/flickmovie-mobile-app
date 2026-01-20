import Slider from '@react-native-community/slider';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, LayoutAnimation, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { MOVIE_GENRES, TV_GENRES, WATCH_PROVIDERS } from "@/services/tmdbapi";

type Step = 0 | 1 | 2 | 3 | 4;
type ContentType = 'movie' | 'tv' | null;
type GameMode = 'swipe' | 'bracket';

export default function GameSetup() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [gameMode, setGameMode] = useState<GameMode>('swipe');
  const [contentType, setContentType] = useState<ContentType>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

  const [minYear, setMinYear] = useState(1990);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [minRating, setMinRating] = useState(0);

  const toggleSelection = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleNextStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    } else {
      handleStartGame();
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      router.back();
    }
  };

  const selectMode = (mode: GameMode) => {
      setGameMode(mode);
      handleNextStep();
  }

  const selectType = (type: 'movie' | 'tv') => {
    setContentType(type);
    setSelectedGenres([]); 
    handleNextStep();
  };

  const handleStartGame = () => {
    const pathname = gameMode === 'bracket' 
        ? "/game/singleplayer/bracket"
        : "/game/singleplayer/play";

    router.push({
      pathname: pathname as any,
      params: {
        type: contentType,
        genres: JSON.stringify(selectedGenres),
        providers: JSON.stringify(selectedProviders),
        minYear: minYear.toString(),
        maxYear: maxYear.toString(),
        minRating: minRating.toString(),
      },
    }); 
  };

  const renderStepMode = () => (
    <View className="flex-1 justify-center gap-6 mt-4">
        <Text className="text-white text-3xl font-bold text-center mb-4">Choose Game Mode</Text>
        
        <TouchableOpacity 
            onPress={() => selectMode('swipe')}
            activeOpacity={0.8}
            className={`w-full p-6 rounded-3xl border-2 bg-black-100 ${gameMode === 'swipe' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
        >
            <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-black-200 rounded-full items-center justify-center mr-4">
                    <Image source={icons.play} className="w-6 h-6" tintColor={gameMode === 'swipe' ? '#FF9C01' : 'white'} />
                </View>
                <View>
                    <Text className={`text-xl font-bold ${gameMode === 'swipe' ? 'text-secondary' : 'text-white'}`}>Classic Swipe</Text>
                    <Text className="text-gray-400 text-xs">Like or Dislike</Text>
                </View>
            </View>
            <Text className="text-gray-300 leading-5">
                Go through a deck of movies one by one. Swipe Right to save, Left to pass. Build your list.
            </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={() => selectMode('bracket')}
            activeOpacity={0.8}
            className={`w-full p-6 rounded-3xl border-2 bg-black-100 ${gameMode === 'bracket' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
        >
            <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-black-200 rounded-full items-center justify-center mr-4">
                    <Image source={icons.star} className="w-6 h-6" tintColor={gameMode === 'bracket' ? '#FF9C01' : 'white'} />
                </View>
                <View>
                    <Text className={`text-xl font-bold ${gameMode === 'bracket' ? 'text-secondary' : 'text-white'}`}>The Bracket 🏆</Text>
                    <Text className="text-gray-400 text-xs">1 vs 1 Battles</Text>
                </View>
            </View>
            <Text className="text-gray-300 leading-5">
                Choose the better movie from pairs. Winners advance until only one ultimate champion remains.
            </Text>
        </TouchableOpacity>
    </View>
  );

  const renderStepType = () => (
    <View className="flex-1 justify-center gap-6 mt-10">
      <TouchableOpacity 
        onPress={() => selectType('movie')}
        activeOpacity={0.8}
        className={`w-full h-40 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'movie' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
      >
        <View className="w-16 h-16 bg-black-200 rounded-full items-center justify-center mb-3">
             <Image source={icons.clapperboard} className="w-8 h-8" tintColor={contentType === 'movie' ? '#FF9C01' : 'white'} />
        </View>
        <Text className={`text-2xl font-bold ${contentType === 'movie' ? 'text-secondary' : 'text-white'}`}>
            Movies
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => selectType('tv')}
        activeOpacity={0.8}
        className={`w-full h-40 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'tv' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
      >
        <View className="w-16 h-16 bg-black-200 rounded-full items-center justify-center mb-3">
             <Image source={icons.screen} className="w-8 h-8" tintColor={contentType === 'tv' ? '#FF9C01' : 'white'} />
        </View>
        <Text className={`text-2xl font-bold ${contentType === 'tv' ? 'text-secondary' : 'text-white'}`}>
            TV Series
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStepVOD = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-2xl text-white font-bold mb-2">Where do you watch?</Text>
      <Text className="text-gray-400 mb-8">Select platforms you have access to.</Text>
      
      <View className="flex-row flex-wrap gap-3">
        {Object.entries(WATCH_PROVIDERS).map(([key, value]) => {
          const id = value as number; 
          const isSelected = selectedProviders.includes(id);
          return (
            <TouchableOpacity
              key={id}
              onPress={() => toggleSelection(id, selectedProviders, setSelectedProviders)}
              className={`w-[48%] py-6 rounded-2xl border items-center justify-center ${
                isSelected
                  ? "bg-secondary border-secondary"
                  : "bg-black-100 border-gray-700"
              }`}
            >
              <Text className={`font-bold text-lg text-center ${isSelected ? "text-primary" : "text-gray-200"}`}>
                {key.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderStepGenres = () => {
    const currentGenresList = contentType === 'tv' ? TV_GENRES : MOVIE_GENRES;

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-2xl text-white font-bold mb-2">What are you in the mood for?</Text>
          <Text className="text-gray-400 mb-8">
             {contentType === 'tv' ? 'Select TV categories.' : 'Select movie genres.'}
          </Text>

          <View className="flex-row flex-wrap gap-2.5">
            {currentGenresList.map((genre) => {
               const isSelected = selectedGenres.includes(genre.id);
               return (
                <TouchableOpacity
                  key={genre.id}
                  onPress={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                  className={`px-5 py-3 rounded-full border mb-1 ${
                    isSelected
                      ? "bg-secondary border-secondary"
                      : "bg-transparent border-gray-600"
                  }`}
                >
                  <Text className={`font-medium ${isSelected ? "text-primary font-bold" : "text-gray-300"}`}>
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
    );
  };

  const renderStepFilters = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-2xl text-white font-bold mb-2">Fine tune results</Text>
            <Text className="text-gray-400 mb-8">Adjust release years and rating.</Text>

            <View className="bg-black-100 p-6 rounded-3xl border border-gray-800 mb-6">
                <Text className="text-secondary font-bold uppercase tracking-widest mb-4">Release Year</Text>
                
                <View className="mb-6">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">From</Text>
                        <Text className="text-white font-bold text-lg">{minYear}</Text>
                    </View>
                    <Slider
                        style={{width: '100%', height: 40}}
                        minimumValue={1970}
                        maximumValue={2026}
                        step={1}
                        value={minYear}
                        onValueChange={(val) => {
                            if (val > maxYear) setMaxYear(val);
                            setMinYear(val);
                        }}
                        minimumTrackTintColor="#FF9C01"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#FF9C01"
                    />
                </View>

                <View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">To</Text>
                        <Text className="text-white font-bold text-lg">{maxYear}</Text>
                    </View>
                    <Slider
                        style={{width: '100%', height: 40}}
                        minimumValue={1970}
                        maximumValue={2026}
                        step={1}
                        value={maxYear}
                        onValueChange={(val) => {
                            if (val < minYear) setMinYear(val);
                            setMaxYear(val);
                        }}
                        minimumTrackTintColor="#FF9C01"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#FF9C01"
                    />
                </View>
            </View>

            <View className="bg-black-100 p-6 rounded-3xl border border-gray-800">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-secondary font-bold uppercase tracking-widest">Min. Rating</Text>
                    <View className="flex-row items-center">
                        <Image source={icons.star} className="w-4 h-4 mr-1" tintColor="#FF9C01" />
                        <Text className="text-white font-bold text-lg">{minRating}+</Text>
                    </View>
                </View>
                
                <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={0}
                    maximumValue={9}
                    step={1}
                    value={minRating}
                    onValueChange={setMinRating}
                    minimumTrackTintColor="#FF9C01"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#FF9C01"
                />
            </View>
        </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-primary">
        <LinearGradient
            colors={["#000C1C", "#161622", "#1E1E2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="absolute w-full h-full"
        />

        <SafeAreaView className="flex-1 px-5">
        <View className="flex-row items-center justify-between mt-4 mb-6">
            <TouchableOpacity onPress={handleBack} className="p-2 bg-black-100 rounded-full border border-gray-800">
                <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
            </TouchableOpacity>
            
            <View className="flex-row gap-2">
                {[0, 1, 2, 3, 4].map(step => (
                    <View 
                        key={step} 
                        className={`h-2 rounded-full transition-all ${step === currentStep ? 'w-8 bg-secondary' : 'w-2 bg-gray-700'}`} 
                    />
                ))}
            </View>
            
            <View className="w-9" />
        </View>

        <View className="flex-1">
            {currentStep === 0 && renderStepMode()}
            {currentStep === 1 && renderStepType()}
            {currentStep === 2 && renderStepVOD()}
            {currentStep === 3 && renderStepGenres()}
            {currentStep === 4 && renderStepFilters()}
        </View>

        {currentStep > 1 && (
            <View className="mb-4 pt-4 border-t border-gray-900">
                <TouchableOpacity
                onPress={handleNextStep}
                className={`w-full py-4 rounded-xl items-center flex-row justify-center ${
                    (currentStep === 3 && selectedGenres.length === 0) 
                    ? "bg-gray-700" 
                    : "bg-secondary"
                }`}
                disabled={currentStep === 3 && selectedGenres.length === 0}
                >
                <Text className={`font-bold text-lg mr-2 ${
                    (currentStep === 3 && selectedGenres.length === 0) ? "text-gray-400" : "text-primary"
                }`}>
                    {currentStep === 4 ? "Start Game" : "Next"}
                </Text>
                {currentStep < 4 && (
                    <Image source={icons.left_arrow} className="w-4 h-4 rotate-180" tintColor="#161622" />
                )}
                </TouchableOpacity>
            </View>
        )}
        </SafeAreaView>
    </View>
  );
}