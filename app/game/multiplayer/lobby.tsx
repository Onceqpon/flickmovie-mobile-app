import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    subscribeToParticipants,
    updateGameSettings // <--- NOWY IMPORT
} from "@/services/gameService";
import { MOVIE_GENRES, TV_GENRES, WATCH_PROVIDERS } from "@/services/tmdbapi";

cssInterop(LinearGradient, { className: "style" });

const MultiplayerLobby = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { gameId, code } = useLocalSearchParams(); 

  const [game, setGame] = useState<GameState | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal Stan
  const [isGenreModalVisible, setGenreModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  
  // --- NOWE STANY DLA EDYCJI USTAWIEŃ ---
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editContentType, setEditContentType] = useState<'movie' | 'tv'>('movie');
  const [editProviders, setEditProviders] = useState<number[]>([]);
  const [editRounds, setEditRounds] = useState("5");
  const [editGenresCount, setEditGenresCount] = useState("2");
  // --------------------------------------

  useEffect(() => {
    let unsubGame: any;
    let unsubParticipants: any;

    const init = async () => {
        try {
            if (gameId) {
                // Host flow (lub powrót do lobby)
                const g = await getGame(gameId as string);
                setGame(g);
                syncEditState(g); // Synchronizacja stanu edycji
                const p = await getGameParticipants(gameId as string);
                setParticipants(p as unknown as GameParticipant[]);
                
                unsubGame = subscribeToGame(gameId as string, (updatedGame) => {
                    setGame(updatedGame);
                    syncEditState(updatedGame); // Aktualizacja live u innych
                    if (updatedGame.status === 'in_progress') {
                        router.replace({ pathname: "/game/multiplayer/play" as any, params: { gameId: updatedGame.$id } });
                    }
                });
                unsubParticipants = subscribeToParticipants(gameId as string, (updatedList) => {
                    setParticipants(updatedList);
                });
            } else if (code && user) {
                // Join flow
                const g = await joinGameByCode(code as string, user.$id, user.name, (user.prefs as any).avatar);
                setGame(g);
                syncEditState(g);
                router.setParams({ gameId: g.$id }); 
            }
        } catch (error: any) {
            Alert.alert("Error", error.message);
            router.replace("/(tabs)");
        }
    };

    init();

    return () => {
        if (unsubGame) unsubGame();
        if (unsubParticipants) unsubParticipants();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, code]);

  // Synchronizuje lokalny stan edycji z aktualnym stanem gry
  const syncEditState = (g: GameState) => {
      setEditContentType(g.content_type);
      setEditProviders(JSON.parse(g.providers || '[]'));
      setEditRounds(g.round_total.toString());
      setEditGenresCount(g.genres_required_count.toString());
  };

  const copyToClipboard = async () => {
    if (game?.game_code) {
        await Clipboard.setStringAsync(game.game_code);
    }
  };

  const toggleGenre = (id: number) => {
      if (selectedGenres.includes(id)) {
          setSelectedGenres(prev => prev.filter(g => g !== id));
      } else {
          if (selectedGenres.length >= (game?.genres_required_count || 2)) {
             Alert.alert("Limit Reached", `You can only pick ${game?.genres_required_count} genres.`);
             return;
          }
          setSelectedGenres(prev => [...prev, id]);
      }
  };

  // --- LOGIKA EDYCJI USTAWIEŃ ---
  const toggleEditProvider = (id: number) => {
      if (editProviders.includes(id)) {
          setEditProviders(prev => prev.filter(p => p !== id));
      } else {
          setEditProviders(prev => [...prev, id]);
      }
  };

  const saveSettings = async () => {
      if (!game) return;
      setLoading(true);
      try {
          await updateGameSettings(game.$id, {
              contentType: editContentType,
              providers: editProviders,
              rounds: parseInt(editRounds) || 5,
              genresCount: parseInt(editGenresCount) || 2
          });
          setSettingsModalVisible(false);
          // Jeśli zmieniono typ (np. z TV na Movie), czyścimy wybrane gatunki gracza, bo mogą nie pasować
          if (game.content_type !== editContentType) {
              setSelectedGenres([]);
          }
      } catch (error: any) {
          Alert.alert("Error", "Failed to update settings: " + error.message);
      } finally {
          setLoading(false);
      }
  };
  // -----------------------------

  const handleStartGame = async () => {
      if (!game) return;
      setLoading(true);
      try {
          await startGame(game.$id);
      } catch (error: any) {
          Alert.alert("Cannot Start", error.message);
          setLoading(false);
      }
  };

  const handleSubmitGenres = async () => {
      const myParticipant = participants.find(p => p.user_id === user?.$id);
      if (myParticipant) {
          try {
              await submitGenres(myParticipant.$id, selectedGenres);
              setGenreModalVisible(false);
              Alert.alert("Success", "Genres submitted! Waiting for others.");
          } catch (error: any) {
              Alert.alert("Error", error.message);
          }
      }
  };

  if (!game) return <View className="flex-1 bg-[#1E1E2D] justify-center items-center"><ActivityIndicator color="#FF9C01" /></View>;

  const isHost = game.host_id === user?.$id;
  const myParticipant = participants.find(p => p.user_id === user?.$id);
  const amIReady = myParticipant?.is_ready;
  const allReady = participants.length > 0 && participants.every(p => p.is_ready);

  // Parsowanie dostawców do wyświetlenia
  const activeProviderIds = JSON.parse(game.providers || '[]');
  const activeProvidersCount = activeProviderIds.length;

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 p-4">
        
        {/* TOP BAR */}
        <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                <Image source={icons.left_arrow} className="w-5 h-5" tintColor="gray" />
            </TouchableOpacity>
            
            {/* PRZYCISK USTAWIEŃ (TYLKO DLA HOSTA) */}
            {isHost && (
                <TouchableOpacity onPress={() => setSettingsModalVisible(true)} className="p-2 bg-white/10 rounded-full">
                     {/* Użyj icons.settings jeśli masz, w przeciwnym razie np. icons.menu lub inny symbol */}
                    <Image source={icons.menu} className="w-5 h-5" tintColor="white" /> 
                </TouchableOpacity>
            )}
        </View>

        {/* CODE SECTION */}
        <TouchableOpacity 
            onPress={copyToClipboard}
            activeOpacity={0.7}
            className="items-center mt-2 mb-6"
        >
            <Text className="text-gray-400 uppercase tracking-widest text-xs mb-1">Room Code</Text>
            <View className="flex-row items-center justify-center gap-3">
                <Text className="text-5xl font-black text-secondary tracking-widest">
                    {game?.game_code || "..."}
                </Text>
                <View className="bg-white/10 p-2 rounded-full">
                    <Image source={icons.copy} className="w-4 h-4" tintColor="#FF9C01" />
                </View>
            </View>
        </TouchableOpacity>

        {/* --- SETTINGS SUMMARY CARD --- */}
        <View className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 flex-row justify-between items-center">
            <View>
                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">Game Mode</Text>
                <View className="flex-row items-center gap-2">
                    <Image 
                        source={game.content_type === 'movie' ? icons.clapperboard : icons.screen} 
                        className="w-4 h-4" 
                        tintColor="#FF9C01" 
                    />
                    <Text className="text-white font-bold text-lg capitalize">
                        {game.content_type === 'movie' ? "Movies" : "TV Series"}
                    </Text>
                </View>
            </View>
            <View className="items-end">
                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">Providers</Text>
                <Text className="text-white font-bold text-lg">
                    {activeProvidersCount === 0 ? "All" : `${activeProvidersCount} Selected`}
                </Text>
            </View>
        </View>

        {/* ACTION BUTTON */}
        {!amIReady && (
            <TouchableOpacity 
                onPress={() => {
                    // Reset wyboru jeśli zmieniono typ gry w międzyczasie
                    setSelectedGenres([]); 
                    setGenreModalVisible(true);
                }}
                className="w-full bg-secondary p-4 rounded-xl items-center shadow-lg shadow-orange-500/20 mb-6"
            >
                <Text className="text-primary font-black text-lg uppercase">Pick Genres</Text>
                <Text className="text-primary/70 text-xs font-bold">Action Required</Text>
            </TouchableOpacity>
        )}

        {/* PLAYERS LIST */}
        <Text className="text-white font-bold text-xl mb-4 ml-2">Players ({participants.length})</Text>
        <FlatList
            data={participants}
            keyExtractor={item => item.$id}
            renderItem={({ item }) => (
                <View className="flex-row items-center justify-between mb-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <View className="flex-row items-center">
                        <Image source={{ uri: item.avatar_url }} className="w-10 h-10 rounded-full mr-3 bg-gray-600" />
                        <View>
                            <Text className="text-white font-bold text-lg">{item.nickname}</Text>
                            {item.user_id === game.host_id && <Text className="text-secondary text-xs font-bold">HOST</Text>}
                        </View>
                    </View>
                    <View>
                        {item.is_ready ? (
                            <View className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/50">
                                <Text className="text-green-400 font-bold text-xs">READY</Text>
                            </View>
                        ) : (
                            <View className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/50">
                                <Text className="text-yellow-500 font-bold text-xs">PICKING...</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        />

        {/* START GAME BUTTON (HOST) */}
        {isHost && (
            <TouchableOpacity 
                onPress={handleStartGame}
                disabled={loading} // Host może zacząć nawet jak nie wszyscy są gotowi (opcjonalnie)
                className={`w-full p-4 rounded-xl items-center mt-4 ${allReady ? 'bg-green-500 shadow-green-500/20' : 'bg-gray-700'}`}
            >
                {loading ? <ActivityIndicator color="#fff" /> : (
                    <Text className="text-white font-black text-lg uppercase">
                        {allReady ? "Start Game" : "Waiting for players..."}
                    </Text>
                )}
            </TouchableOpacity>
        )}

        {/* --- MODAL WYBORU GATUNKÓW --- */}
        <Modal visible={isGenreModalVisible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#1E1E2D] p-5">
                <Text className="text-white text-2xl font-bold mb-2 mt-4">Select Genres</Text>
                <Text className="text-gray-400 mb-6">
                    Pick exactly <Text className="text-secondary font-bold">{game.genres_required_count}</Text> {game.content_type === 'tv' ? 'TV' : 'movie'} genres.
                </Text>

                <FlatList
                    data={game.content_type === 'tv' ? TV_GENRES : MOVIE_GENRES} // Dynamiczna lista
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isSelected = selectedGenres.includes(item.id);
                        return (
                            <TouchableOpacity
                                onPress={() => toggleGenre(item.id)}
                                className={`w-[48%] p-4 rounded-xl mb-3 border ${isSelected ? 'bg-secondary border-secondary' : 'bg-white/5 border-white/10'}`}
                            >
                                <Text className={`text-center font-bold ${isSelected ? 'text-primary' : 'text-gray-300'}`}>{item.name}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
                
                <TouchableOpacity 
                    onPress={handleSubmitGenres}
                    disabled={selectedGenres.length !== game.genres_required_count}
                    className={`w-full p-4 rounded-xl items-center mt-4 mb-8 ${selectedGenres.length === game.genres_required_count ? 'bg-secondary' : 'bg-gray-700'}`}
                >
                    <Text className="text-primary font-black text-lg">Confirm Selection</Text>
                </TouchableOpacity>
            </View>
        </Modal>

        {/* --- MODAL EDYCJI USTAWIEŃ (HOST ONLY) --- */}
        <Modal visible={isSettingsModalVisible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#1E1E2D] p-5">
                <View className="flex-row justify-between items-center mt-4 mb-6">
                    <Text className="text-white text-2xl font-bold">Lobby Settings</Text>
                    <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                        <Text className="text-gray-400 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* TYPE */}
                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Content Type</Text>
                    <View className="flex-row gap-4 mb-8">
                        <TouchableOpacity 
                            onPress={() => setEditContentType('movie')}
                            className={`flex-1 p-4 rounded-xl border-2 items-center ${editContentType === 'movie' ? 'bg-secondary/20 border-secondary' : 'bg-black-100 border-gray-700'}`}
                        >
                            <Text className={`font-bold ${editContentType === 'movie' ? 'text-secondary' : 'text-gray-400'}`}>Movies</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setEditContentType('tv')}
                            className={`flex-1 p-4 rounded-xl border-2 items-center ${editContentType === 'tv' ? 'bg-secondary/20 border-secondary' : 'bg-black-100 border-gray-700'}`}
                        >
                            <Text className={`font-bold ${editContentType === 'tv' ? 'text-secondary' : 'text-gray-400'}`}>TV Series</Text>
                        </TouchableOpacity>
                    </View>

                    {/* NUMBERS */}
                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Game Config</Text>
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-white mb-2">Rounds</Text>
                            <TextInput 
                                value={editRounds} 
                                onChangeText={setEditRounds} 
                                keyboardType="numeric"
                                className="bg-black-100 text-white p-4 rounded-xl border border-gray-700 font-bold"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-2">Genres / Player</Text>
                            <TextInput 
                                value={editGenresCount} 
                                onChangeText={setEditGenresCount} 
                                keyboardType="numeric"
                                className="bg-black-100 text-white p-4 rounded-xl border border-gray-700 font-bold"
                            />
                        </View>
                    </View>

                    {/* PROVIDERS */}
                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Streaming Providers</Text>
                    <View className="flex-row flex-wrap gap-2 pb-10">
                        {Object.entries(WATCH_PROVIDERS).map(([key, value]) => {
                            const id = value as number; 
                            const isSelected = editProviders.includes(id);
                            return (
                                <TouchableOpacity
                                    key={id}
                                    onPress={() => toggleEditProvider(id)}
                                    className={`px-4 py-3 rounded-lg border ${isSelected ? "bg-secondary border-secondary" : "bg-black-100 border-gray-700"}`}
                                >
                                    <Text className={`font-bold text-xs ${isSelected ? "text-primary" : "text-gray-300"}`}>
                                        {key.replace("_", " ")}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    onPress={saveSettings}
                    disabled={loading}
                    className="w-full bg-secondary p-4 rounded-xl items-center mb-8"
                >
                    {loading ? <ActivityIndicator color="#000" /> : <Text className="text-primary font-black text-lg">Save Changes</Text>}
                </TouchableOpacity>
            </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

export default MultiplayerLobby;