import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getGame, saveToHistory } from "@/services/gameService"; // <--- IMPORTUJEMY saveToHistory

cssInterop(LinearGradient, { className: "style" });

const MultiplayerResults = () => {
    const { user } = useGlobalContext();
    const router = useRouter();
    const { gameId } = useLocalSearchParams();

    const [winners, setWinners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Stany do obsługi przycisku
    const [saving, setSaving] = useState(false);
    const [alreadySaved, setAlreadySaved] = useState(false);

    useEffect(() => {
        if (!gameId) return;

        const loadResults = async () => {
            try {
                // Pobieramy wynik gry
                const finalGame = await getGame(gameId as string);
                if (finalGame.movies_pool) {
                    const results = JSON.parse(finalGame.movies_pool);
                    setWinners(results);
                }
            } catch (error) {
                console.error("Results load error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [gameId]);

    // --- FUNKCJA ZAPISUJĄCA DO HISTORII ---
    const handleSaveHistory = async () => {
        if (!user || winners.length === 0) return;
        setSaving(true);
        try {
            await saveToHistory(user.$id, winners);
            setAlreadySaved(true);
            Alert.alert("Success", "Saved to your game history!");
        } catch (error: any) {
            Alert.alert("Error", "Could not save history: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleExit = () => {
        router.replace("/(tabs)");
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#1E1E2D] justify-center items-center">
                <ActivityIndicator size="large" color="#FF9C01" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#1E1E2D]">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            <SafeAreaView className="flex-1 p-6">
                
                <View className="items-center mt-10 mb-8">
                    <Text className="text-4xl font-black text-secondary uppercase tracking-widest text-center">
                        It&apos;s a Match!
                    </Text>
                    <Text className="text-gray-400 mt-2 text-center">
                        We found {winners.length} movies you all loved.
                    </Text>
                </View>

                {winners.length === 0 ? (
                    <View className="flex-1 justify-center items-center opacity-50">
                        <Image source={icons.close} className="w-20 h-20 mb-4" tintColor="#fff" />
                        <Text className="text-white text-xl font-bold">No common movies found.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={winners}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ gap: 10 }}
                        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                        renderItem={({ item, index }) => (
                            <View className="flex-1 bg-black/20 rounded-xl overflow-hidden border border-white/10 relative">
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                                    className="w-full h-40"
                                    resizeMode="cover"
                                />
                                {index === 0 && (
                                    <View className="absolute top-2 right-2 bg-secondary px-2 py-1 rounded shadow-md">
                                        <Text className="text-white font-black text-xs">#1 PICK</Text>
                                    </View>
                                )}
                                <View className="p-2">
                                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.title}</Text>
                                </View>
                            </View>
                        )}
                    />
                )}

                <View className="mt-4 gap-y-3">
                    {/* PRZYCISK ZAPISU DO HISTORII */}
                    {winners.length > 0 && (
                        <TouchableOpacity
                            onPress={handleSaveHistory}
                            disabled={saving || alreadySaved}
                            className={`p-4 rounded-xl items-center flex-row justify-center border ${alreadySaved ? 'bg-green-500/20 border-green-500' : 'bg-white/10 border-white/20'}`}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Image 
                                        source={alreadySaved ? icons.play : icons.plus} 
                                        className="w-5 h-5 mr-2" 
                                        tintColor="white" 
                                    />
                                    <Text className="text-white font-bold text-lg">
                                        {alreadySaved ? "Saved to History" : "Save to History"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleExit}
                        className="bg-secondary p-4 rounded-xl items-center shadow-lg shadow-orange-500/20"
                    >
                        <Text className="text-primary font-black text-lg uppercase">Back to Home</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
};

export default MultiplayerResults;