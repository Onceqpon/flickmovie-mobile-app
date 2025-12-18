import { icons } from "@/constants/icons";
// CHANGE: Importing separated genre lists
import { MOVIE_GENRES, TV_GENRES, WATCH_PROVIDERS } from "@/services/tmdbapi";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, LayoutAnimation, Platform, ScrollView, Text, TouchableOpacity, UIManager, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Step = 0 | 1 | 2; // 0: Type, 1: VOD, 2: Genres
type ContentType = 'movie' | 'tv' | null;

export default function GameSetup() {
  const router = useRouter();
  
  // States
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [contentType, setContentType] = useState<ContentType>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);

  // Selection logic
  const toggleSelection = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleNextStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentStep < 2) {
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

  const selectType = (type: 'movie' | 'tv') => {
    setContentType(type);
    // CHANGE: Reset genres on type change to avoid invalid IDs
    setSelectedGenres([]); 
    handleNextStep();
  };

  const handleStartGame = () => {
    router.push({
      pathname: "/game/play",
      params: {
        type: contentType,
        genres: JSON.stringify(selectedGenres),
        providers: JSON.stringify(selectedProviders),
      },
    } as any); 
  };

  // --- STEP COMPONENTS ---

  // STEP 1: SELECT TYPE
  const renderStepType = () => (
    <View className="flex-1 justify-center gap-6 mt-10">
      <TouchableOpacity 
        onPress={() => selectType('movie')}
        activeOpacity={0.8}
        className={`w-full h-48 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'movie' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
      >
        <View className="w-20 h-20 bg-black-200 rounded-full items-center justify-center mb-4">
             <Image source={icons.clapperboard} className="w-10 h-10" tintColor={contentType === 'movie' ? '#FF9C01' : 'white'} />
        </View>
        <Text className={`text-2xl font-bold ${contentType === 'movie' ? 'text-secondary' : 'text-white'}`}>
            Movies
        </Text>
        <Text className="text-gray-400 mt-2">Feature films</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => selectType('tv')}
        activeOpacity={0.8}
        className={`w-full h-48 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'tv' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
      >
        <View className="w-20 h-20 bg-black-200 rounded-full items-center justify-center mb-4">
             <Image source={icons.screen} className="w-10 h-10" tintColor={contentType === 'tv' ? '#FF9C01' : 'white'} />
        </View>
        <Text className={`text-2xl font-bold ${contentType === 'tv' ? 'text-secondary' : 'text-white'}`}>
            TV Series
        </Text>
        <Text className="text-gray-400 mt-2">Binge-watching episodes</Text>
      </TouchableOpacity>
    </View>
  );

  // STEP 2: VOD
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

  // STEP 3: GENRES (MODIFIED)
  const renderStepGenres = () => {
    // CHANGE: Dynamic list selection based on contentType
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

  return (
    <SafeAreaView className="flex-1 bg-primary px-5">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        <TouchableOpacity onPress={handleBack} className="p-2 bg-black-100 rounded-full border border-gray-800">
           <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
        </TouchableOpacity>
        
        {/* Progress bar (dots) */}
        <View className="flex-row gap-2">
           {[0, 1, 2].map(step => (
                <View 
                    key={step} 
                    className={`h-2 rounded-full transition-all ${step === currentStep ? 'w-8 bg-secondary' : 'w-2 bg-gray-700'}`} 
                />
            ))}
        </View>
        
        {/* Empty view for symmetry */}
        <View className="w-9" />
      </View>

      {/* MAIN CONTENT */}
      <View className="flex-1">
        {currentStep === 0 && renderStepType()}
        {currentStep === 1 && renderStepVOD()}
        {currentStep === 2 && renderStepGenres()}
      </View>

      {/* BOTTOM BUTTON (Only for steps 1 and 2, because step 0 is automatic) */}
      {currentStep > 0 && (
          <View className="mb-4 pt-4 border-t border-gray-900">
            <TouchableOpacity
              onPress={handleNextStep}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${
                 (currentStep === 2 && selectedGenres.length === 0) 
                 ? "bg-gray-700" 
                 : "bg-secondary"
              }`}
              disabled={currentStep === 2 && selectedGenres.length === 0}
            >
              <Text className={`font-bold text-lg mr-2 ${
                 (currentStep === 2 && selectedGenres.length === 0) ? "text-gray-400" : "text-primary"
              }`}>
                {currentStep === 2 ? "Start Game" : "Next"}
              </Text>
              {currentStep < 2 && (
                  <Image source={icons.left_arrow} className="w-4 h-4 rotate-180" tintColor="#161622" />
              )}
            </TouchableOpacity>
          </View>
      )}
    </SafeAreaView>
  );
}