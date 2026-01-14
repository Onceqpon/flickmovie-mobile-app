import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, LayoutAnimation, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { createGame } from "@/services/gameService";
import { WATCH_PROVIDERS } from "@/services/tmdbapi";

cssInterop(LinearGradient, { className: "style" });

type Step = 0 | 1 | 2;
type ContentType = 'movie' | 'tv' | null;

const CreateGameWizard = () => {
    const router = useRouter();
    const { user } = useGlobalContext();
    
    // --- STATE ---
    const [currentStep, setCurrentStep] = useState<Step>(0);
    const [loading, setLoading] = useState(false);

    // DANE GRY
    const [contentType, setContentType] = useState<ContentType>(null);
    const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
    
    // USTAWIENIA (Rounds / Genres count)
    const [rounds, setRounds] = useState("5");
    const [genresCount, setGenresCount] = useState("2");

    // --- LOGIKA ---
    const toggleProvider = (id: number) => {
        if (selectedProviders.includes(id)) {
            setSelectedProviders(prev => prev.filter(item => item !== id));
        } else {
            setSelectedProviders(prev => prev.filter(item => item !== id)); // Najpierw czyścimy duplikaty dla pewności
            setSelectedProviders(prev => [...prev, id]);
        }
    };

    const handleNextStep = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (currentStep < 2) {
            setCurrentStep((prev) => (prev + 1) as Step);
        } else {
            handleCreateGame();
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
        handleNextStep();
    };

    const handleCreateGame = async () => {
        if (!user || !contentType) return;
        setLoading(true);
        try {
            const game = await createGame(
                user.$id, 
                user.name, 
                (user.prefs as any).avatar, 
                {
                    rounds: parseInt(rounds) || 5,
                    genresCount: parseInt(genresCount) || 2,
                    contentType: contentType,
                    providers: selectedProviders
                }
            );
            
            // Przejdź do Lobby z ID nowej gry
            router.replace({ pathname: "/game/multiplayer/lobby" as any, params: { gameId: game.$id } });
        } catch (error: any) {
            Alert.alert("Error", error.message);
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    // KROK 1: TYP (Movies / TV)
    const renderStepType = () => (
        <View className="flex-1 justify-center gap-6 mt-4">
          <TouchableOpacity 
            onPress={() => selectType('movie')}
            activeOpacity={0.8}
            className={`w-full h-40 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'movie' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
          >
            <Image source={icons.clapperboard} className="w-12 h-12 mb-2" tintColor={contentType === 'movie' ? '#FF9C01' : 'white'} />
            <Text className={`text-2xl font-bold ${contentType === 'movie' ? 'text-secondary' : 'text-white'}`}>Movies</Text>
          </TouchableOpacity>
    
          <TouchableOpacity 
            onPress={() => selectType('tv')}
            activeOpacity={0.8}
            className={`w-full h-40 rounded-3xl border-2 items-center justify-center bg-black-100 ${contentType === 'tv' ? 'border-secondary bg-secondary/10' : 'border-gray-700'}`}
          >
            <Image source={icons.screen} className="w-12 h-12 mb-2" tintColor={contentType === 'tv' ? '#FF9C01' : 'white'} />
            <Text className={`text-2xl font-bold ${contentType === 'tv' ? 'text-secondary' : 'text-white'}`}>TV Series</Text>
          </TouchableOpacity>
        </View>
    );

    // KROK 2: PROVIDERS
    const renderStepProviders = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-2xl text-white font-bold mb-2">Streaming Services</Text>
          <Text className="text-gray-400 mb-6">Select platforms to include in the search.</Text>
          
          <View className="flex-row flex-wrap gap-3 pb-10">
            {Object.entries(WATCH_PROVIDERS).map(([key, value]) => {
              const id = value as number; 
              const isSelected = selectedProviders.includes(id);
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => toggleProvider(id)}
                  className={`w-[48%] py-5 rounded-2xl border items-center justify-center ${isSelected ? "bg-secondary border-secondary" : "bg-black-100 border-gray-700"}`}
                >
                  <Text className={`font-bold text-base text-center ${isSelected ? "text-primary" : "text-gray-200"}`}>
                    {key.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
    );

    // KROK 3: USTAWIENIA GRY
    const renderStepSettings = () => (
        <View className="flex-1">
            <Text className="text-2xl text-white font-bold mb-2">Game Settings</Text>
            <Text className="text-gray-400 mb-8">Fine tune your session.</Text>

            <View className="gap-6">
                <View>
                    <Text className="text-gray-300 mb-2 font-bold ml-1">Total Rounds</Text>
                    <TextInput
                        value={rounds}
                        onChangeText={setRounds}
                        keyboardType="numeric"
                        className="bg-black-100 text-white p-5 rounded-xl border border-gray-700 font-bold text-lg"
                    />
                    <Text className="text-gray-500 text-xs mt-1 ml-1">How many elimination rounds?</Text>
                </View>

                <View>
                    <Text className="text-gray-300 mb-2 font-bold ml-1">Genres per Player</Text>
                    <TextInput
                        value={genresCount}
                        onChangeText={setGenresCount}
                        keyboardType="numeric"
                        className="bg-black-100 text-white p-5 rounded-xl border border-gray-700 font-bold text-lg"
                    />
                    <Text className="text-gray-500 text-xs mt-1 ml-1">How many genres each player must pick in Lobby.</Text>
                </View>

                {/* Podsumowanie */}
                <View className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Summary</Text>
                    <Text className="text-white font-bold text-lg">Type: <Text className="text-secondary capitalize">{contentType === 'movie' ? 'Movies' : 'TV Series'}</Text></Text>
                    <Text className="text-white font-bold text-lg">Providers: <Text className="text-secondary">{selectedProviders.length > 0 ? selectedProviders.length : 'All'}</Text></Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-primary">
            <LinearGradient colors={["#000C1C", "#161622", "#1E1E2D"]} className="absolute w-full h-full" />
            <SafeAreaView className="flex-1 px-5">
                
                {/* Header */}
                <View className="flex-row items-center justify-between mt-4 mb-6">
                    <TouchableOpacity onPress={handleBack} className="p-2 bg-black-100 rounded-full border border-gray-800">
                        <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
                    </TouchableOpacity>
                    
                    <View className="flex-row gap-2">
                        {[0, 1, 2].map(step => (
                            <View key={step} className={`h-2 rounded-full transition-all ${step === currentStep ? 'w-8 bg-secondary' : 'w-2 bg-gray-700'}`} />
                        ))}
                    </View>
                    <View className="w-9" />
                </View>

                {/* Content */}
                <View className="flex-1">
                    {currentStep === 0 && renderStepType()}
                    {currentStep === 1 && renderStepProviders()}
                    {currentStep === 2 && renderStepSettings()}
                </View>

                {/* Footer Button */}
                <View className="mb-4 pt-4 border-t border-gray-900">
                    <TouchableOpacity
                        onPress={handleNextStep}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl items-center flex-row justify-center bg-secondary ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : (
                            <>
                                <Text className="font-bold text-lg text-primary mr-2">
                                    {currentStep === 2 ? "Create Lobby" : "Next"}
                                </Text>
                                {currentStep < 2 && (
                                    <Image source={icons.left_arrow} className="w-4 h-4 rotate-180" tintColor="#161622" />
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
};

export default CreateGameWizard;