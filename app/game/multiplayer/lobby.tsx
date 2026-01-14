import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
    GameParticipant,
    GameState,
    getGame,
    getGameParticipants,
    joinGameByCode,
    startGame,
    submitGenres,
    subscribeToGame,
    subscribeToParticipants
} from "@/services/gameService";
import { MOVIE_GENRES, TV_GENRES } from "@/services/tmdbapi";

cssInterop(LinearGradient, { className: "style" });

const MultiplayerLobby = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { gameId } = useLocalSearchParams();

  const [joinCode, setJoinCode] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const copyToClipboard = async () => {
    if (game?.game_code) {
        await Clipboard.setStringAsync(game.game_code);
        Alert.alert("Copied!", "Code copied to clipboard"); 
    }
  };

  useEffect(() => {
    if (!gameId) return;

    let unsubGame: any;
    let unsubParticipants: any;

    const initLobby = async () => {
      setLoading(true);
      try {
        // 1. POBIERZ DANE GRY NATYCHMIAST (Naprawia brak kodu gry)
        const initialGame = await getGame(gameId as string);
        setGame(initialGame);

        // 2. Subskrybuj zmiany
        unsubGame = subscribeToGame(gameId as string, (updatedGame) => {
            setGame(updatedGame);
            if (updatedGame.status === 'in_progress') {
                router.replace({ pathname: "/game/multiplayer/play" as any, params: { gameId: updatedGame.$id } });
            }
        });

        unsubParticipants = subscribeToParticipants(gameId as string, (updatedList) => {
            setParticipants(updatedList);
        });

        const initialParticipants = await getGameParticipants(gameId as string);
        setParticipants(initialParticipants as unknown as GameParticipant[]);
        
      } catch (error) {
        console.error("Lobby init error:", error);
        Alert.alert("Error", "Failed to connect to lobby");
      } finally {
        setLoading(false);
      }
    };

    initLobby();

    return () => {
      if (unsubGame) unsubGame();
      if (unsubParticipants) unsubParticipants();
    };
  }, [gameId, router]);

  const handleJoin = async () => {
    if (!user || !joinCode) return;
    setLoading(true);
    try {
        const joinedGame = await joinGameByCode(
            joinCode, 
            user.$id, 
            user.name, 
            (user.prefs as any).avatar
        );
        router.push({ pathname: "/game/multiplayer/lobby" as any, params: { gameId: joinedGame.$id } });
    } catch (error: any) {
        Alert.alert("Join Failed", error.message);
        setLoading(false);
    }
  };

  const handleStartGame = async () => {
      if (!game) return;
      try {
          setLoading(true);
          await startGame(game.$id);
      } catch (error: any) {
          Alert.alert("Error", "Could not start game: " + error.message);
          setLoading(false);
      }
  };

  const submitMyGenres = async () => {
      if (!user || !game) {
        Alert.alert("Error", "Missing user or game data");
        return;
      }
      
      // Znajdź mój rekord w uczestnikach
      const myParticipantId = participants.find(p => p.user_id === user.$id)?.$id;
      
      if (!myParticipantId) {
         Alert.alert("Error", "You are not listed as a participant. Try re-joining.");
         return;
      }

      try {
          await submitGenres(myParticipantId, selectedGenres);
          setShowGenreModal(false);
          // Opcjonalnie: wyczyść wybór lokalny lub zostaw
      } catch (error: any) {
          console.error("Genre submit error:", error);
          Alert.alert("Error saving genres", error.message);
      }
  };

  // --- WIDOK JOIN (gdy brak gameId) ---
  if (!gameId) {
      return (
        <View className="flex-1 bg-[#1E1E2D] justify-center p-6">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            
            <View className="items-center mb-10">
                <Text className="text-4xl font-black text-white">JOIN PARTY</Text>
                <Text className="text-gray-400 mt-2">Enter the 6-digit code</Text>
            </View>

            <TextInput
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="123456"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={6}
                className="bg-black/30 text-white text-center text-4xl tracking-[10px] font-black p-6 rounded-2xl border-2 border-secondary mb-6"
            />

            <TouchableOpacity 
                onPress={handleJoin} 
                disabled={loading || joinCode.length < 6}
                className={`bg-secondary w-full p-4 rounded-xl items-center ${joinCode.length < 6 ? 'opacity-50' : ''}`}
            >
                {loading ? <ActivityIndicator color="#000"/> : (
                    <Text className="text-primary font-bold text-xl uppercase">Enter Lobby</Text>
                )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.back()} className="mt-6">
                <Text className="text-gray-400">Cancel</Text>
            </TouchableOpacity>
        </View>
      );
  }

  // --- WIDOK LOBBY ---
  const isHost = game?.host_id === user?.$id;
  const myParticipant = participants.find(p => p.user_id === user?.$id);
  const amIReady = myParticipant?.is_ready;
  const allReady = participants.length > 0 && participants.every(p => p.is_ready);

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 p-4">
        
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="mb-4">
            <Text className="text-gray-500">Quit Lobby</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={copyToClipboard}
            activeOpacity={0.7}
            className="items-center mt-4 mb-8"
        >
            <Text className="text-gray-400 uppercase tracking-widest text-xs mb-1">
                Room Code (Tap to copy)
            </Text>
            <View className="flex-row items-center justify-center gap-3">
                <Text className="text-5xl font-black text-secondary tracking-widest">
                    {game?.game_code || "..."}
                </Text>
                {/* Używamy ikonki, np. plusa lub innej dostępnej, jeśli nie masz 'copy' */}
                {/* Jeśli masz ikonę 'copy' w constants/icons, użyj jej. Tutaj przykład: */}
                <View className="bg-white/10 p-2 rounded-full">
                     {/* Zastąp icons.plus ikoną icons.copy jeśli masz */}
                    <Image source={icons.plus} className="w-4 h-4" tintColor="#FF9C01" />
                </View>
            </View>
        </TouchableOpacity>

        {!amIReady && (
            <View className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-6 flex-row justify-between items-center">
                <Text className="text-red-200 font-semibold">Action Required:</Text>
                <TouchableOpacity 
                    onPress={() => setShowGenreModal(true)}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                >
                    <Text className="text-white font-bold text-xs">Select Genres</Text>
                </TouchableOpacity>
            </View>
        )}

        <Text className="text-white font-bold text-lg mb-4">Players ({participants.length})</Text>
        <FlatList
            data={participants}
            keyExtractor={item => item.$id}
            renderItem={({ item }) => (
                <View className="flex-row items-center bg-white/5 p-3 rounded-xl mb-2 border border-white/5">
                    <Image 
                        source={{ uri: item.avatar_url }} 
                        className="w-10 h-10 rounded-full mr-3 bg-gray-600" 
                    />
                    <View className="flex-1">
                        <Text className="text-white font-bold text-base">
                            {item.nickname} {item.user_id === user?.$id ? "(You)" : ""}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            {item.is_ready ? "Ready" : "Choosing genres..."}
                        </Text>
                    </View>
                    {item.is_ready && (
                        <Image source={icons.play} className="w-5 h-5" tintColor="#4ADE80" /> 
                    )}
                </View>
            )}
        />

        {isHost && (
            <View className="mt-4">
                <TouchableOpacity
                    onPress={handleStartGame}
                    disabled={!allReady || loading}
                    className={`bg-secondary p-5 rounded-2xl items-center shadow-lg shadow-orange-500/20 ${(!allReady || loading) ? 'opacity-50 grayscale' : ''}`}
                >
                    {loading ? <ActivityIndicator color="#000" /> : (
                        <Text className="text-primary font-black text-xl uppercase">Start Game</Text>
                    )}
                </TouchableOpacity>
            </View>
        )}

        <Modal visible={showGenreModal} animationType="slide" transparent>
            <View className="flex-1 bg-black/90 justify-end">
                <View className="bg-[#1E1E2D] h-[80%] rounded-t-3xl p-6">
                    <Text className="text-white text-2xl font-bold mb-2">Select {game?.genres_required_count} Genres</Text>
                    
                    <FlatList
                        data={game?.content_type === 'tv' ? TV_GENRES : MOVIE_GENRES}
                        numColumns={2}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ gap: 10 }}
                        columnWrapperStyle={{ gap: 10 }}
                        renderItem={({ item }) => {
                            const isSelected = selectedGenres.includes(item.id);
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (isSelected) {
                                            setSelectedGenres(prev => prev.filter(id => id !== item.id));
                                        } else {
                                            if (selectedGenres.length < (game?.genres_required_count || 2)) {
                                                setSelectedGenres(prev => [...prev, item.id]);
                                            }
                                        }
                                    }}
                                    className={`flex-1 p-4 rounded-xl border-2 items-center ${isSelected ? 'bg-secondary border-secondary' : 'bg-white/5 border-transparent'}`}
                                >
                                    <Text className={`font-bold ${isSelected ? 'text-primary' : 'text-gray-300'}`}>{item.name}</Text>
                                </TouchableOpacity>
                            )
                        }}
                    />

                    <TouchableOpacity
                        onPress={submitMyGenres}
                        disabled={selectedGenres.length !== (game?.genres_required_count || 2)}
                        className={`mt-4 bg-secondary p-4 rounded-xl items-center ${selectedGenres.length !== (game?.genres_required_count || 2) ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-primary font-black uppercase">Confirm Selection</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default MultiplayerLobby;