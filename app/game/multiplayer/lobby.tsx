import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
    GameParticipant,
    GameState,
    getGame,
    getGameParticipants,
    joinGameByCode,
    leaveGame,
    resetParticipantsGenres,
    startGame,
    submitGenres,
    subscribeToGame,
    subscribeToParticipants,
    updateGameSettings
} from "@/services/gameService";
import { MOVIE_GENRES, TV_GENRES, WATCH_PROVIDERS } from "@/services/tmdbapi";

cssInterop(LinearGradient, { className: "style" });

const GenreItem = React.memo(({ item, isSelected, onPress }: { item: any, isSelected: boolean, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.genreItem, isSelected ? styles.genreItemSelected : styles.genreItemUnselected]}>
        <Text style={[styles.genreText, isSelected ? styles.genreTextSelected : styles.genreTextUnselected]}>{item.name}</Text>
    </TouchableOpacity>
));
GenreItem.displayName = 'GenreItem';

const ParticipantItem = React.memo(({ item, isHost, contentType }: { item: GameParticipant, isHost: boolean, contentType: 'movie' | 'tv' }) => {
    const getGenreNames = () => {
        try {
            const selectedIds = JSON.parse(item.selected_genres || '[]');
            if (selectedIds.length === 0) return "Picking...";
            const genreList = contentType === 'tv' ? TV_GENRES : MOVIE_GENRES;
            const names = genreList.filter(g => selectedIds.includes(g.id)).map(g => g.name);
            if (names.length === 0) return "Picking...";
            return names.join(", ");
        } catch (e) { return "Picking..."; }
    };
    return (
        <View style={styles.participantItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.nickname} numberOfLines={1}>{item.nickname}</Text>
                        {isHost && <Text style={styles.hostBadge}>HOST</Text>}
                    </View>
                    <Text style={styles.genresText} numberOfLines={1} ellipsizeMode="tail">{getGenreNames()}</Text>
                </View>
            </View>
            <View>{item.is_ready ? <View style={styles.statusReady}><Text style={styles.statusReadyText}>READY</Text></View> : <View style={styles.statusPicking}><Text style={styles.statusPickingText}>PICKING...</Text></View>}</View>
        </View>
    );
});
ParticipantItem.displayName = 'ParticipantItem';


const MultiplayerLobby = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { gameId, code } = useLocalSearchParams(); 

  const [game, setGame] = useState<GameState | null>(null);
  const gameRef = useRef<GameState | null>(null); 

  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isGenreModalVisible, setGenreModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editContentType, setEditContentType] = useState<'movie' | 'tv'>('movie');
  const [editProviders, setEditProviders] = useState<number[]>([]);
  const [editGenresCount, setEditGenresCount] = useState("2");

  useEffect(() => {
    let unsubGame: any;
    let unsubParticipants: any;

    const init = async () => {
        try {
            if (gameId) {
                const g = await getGame(gameId as string);
                setGame(g);
                gameRef.current = g;
                syncEditState(g); 

                const p = await getGameParticipants(gameId as string);
                setParticipants(p as unknown as GameParticipant[]);
                
                unsubGame = subscribeToGame(gameId as string, (updatedGame) => {
                    if (!updatedGame) {
                        Alert.alert("Lobby Closed", "The host has left the lobby.");
                        router.replace("/(tabs)" as any);
                        return;
                    }

                    if (gameRef.current && gameRef.current.content_type !== updatedGame.content_type) {
                        setSelectedGenres([]);
                        Alert.alert("Mode Changed", `Host switched to ${updatedGame.content_type === 'movie' ? 'Movies' : 'TV Series'}. Please pick genres again.`);
                    }
                    setGame(updatedGame);
                    gameRef.current = updatedGame;
                    syncEditState(updatedGame); 
                    
                    const imHost = updatedGame.host_id === user?.$id;
                    if (updatedGame.status === 'in_progress' && !imHost) {
                        router.replace({ pathname: "/game/multiplayer/play" as any, params: { gameId: updatedGame.$id } });
                    }
                });

                unsubParticipants = subscribeToParticipants(gameId as string, (updatedList) => {
                    setParticipants(updatedList);

                    if (gameRef.current) {
                        const currentHostId = gameRef.current.host_id;
                        const isHostPresent = updatedList.some(p => p.user_id === currentHostId);
                        
                        if (!isHostPresent && user?.$id !== currentHostId) {
                            Alert.alert("Lobby Closed", "The host has disconnected.");
                            router.replace("/(tabs)" as any);
                        }
                    }
                });

            } else if (code && user) {
                const g = await joinGameByCode(code as string, user.$id, user.name, (user.prefs as any).avatar);
                router.replace({ pathname: "/game/multiplayer/lobby", params: { gameId: g.$id } });
            }
        } catch (error: any) {
            if (error.message.includes('404') || error.message.includes('not found')) {
                Alert.alert("Lobby Closed", "The host has left the lobby.");
                router.replace("/(tabs)" as any);
            } else {
                Alert.alert("Error", error.message);
                router.replace("/(tabs)");
            }
        }
    };

    init();

    return () => {
        if (unsubGame) unsubGame();
        if (unsubParticipants) unsubParticipants();
    };
  }, [gameId, code]);

  const syncEditState = (g: GameState) => {
      setEditContentType(g.content_type || 'movie');
      setEditProviders(JSON.parse(g.providers || '[]'));
      setEditGenresCount((g.genres_required_count || 2).toString());
  };

  const copyToClipboard = async () => {
    if (game?.game_code) await Clipboard.setStringAsync(game.game_code);
  };

  const toggleGenre = useCallback((id: number) => {
      setSelectedGenres(prev => {
          if (prev.includes(id)) return prev.filter(g => g !== id);
          else {
              if (prev.length >= (game?.genres_required_count || 2)) {
                 Alert.alert("Limit Reached", `You can only pick ${game?.genres_required_count} genres.`);
                 return prev;
              }
              return [...prev, id];
          }
      });
  }, [game]);

  const toggleEditProvider = (id: number) => {
      if (editProviders.includes(id)) setEditProviders(prev => prev.filter(p => p !== id));
      else setEditProviders(prev => [...prev, id]);
  };

  const saveSettings = async () => {
      if (!game) return;
      setLoading(true);
      try {
          if (game.content_type !== editContentType) {
              await resetParticipantsGenres(game.$id);
              setSelectedGenres([]); 
          }

          await updateGameSettings(game.$id, {
              contentType: editContentType,
              providers: editProviders,
              genresCount: parseInt(editGenresCount) || 2
          });
          
          setSettingsModalVisible(false);
      } catch (error: any) {
          Alert.alert("Error", "Failed to update settings: " + error.message);
      } finally {
          setLoading(false);
      }
  };

  const handleStartGame = async () => {
      if (!game) return;
      if (participants.length < 2) {
          Alert.alert("Need more players", "You need at least 2 players to start a multiplayer game.");
          return;
      }
      setLoading(true);
      try {
          await startGame(game.$id);
          router.replace({ pathname: "/game/multiplayer/play" as any, params: { gameId: game.$id } });
      } catch (error: any) {
          Alert.alert("Cannot Start", error.message);
          setLoading(false);
      }
  };

  const handleSubmitGenres = async () => {
      const myParticipant = participants.find(p => p.user_id === user?.$id);
      if (myParticipant) {
          try {
              setGenreModalVisible(false); 
              await submitGenres(myParticipant.$id, selectedGenres);
          } catch (error: any) {
              Alert.alert("Error", error.message);
          }
      }
  };

  const handleLeaveLobby = async () => {
      if (!game || !user) return;
      const isHost = game.host_id === user.$id;
      const myParticipant = participants.find(p => p.user_id === user.$id);

      Alert.alert(
          isHost ? "Delete Lobby?" : "Leave Lobby?",
          isHost ? "If you leave, the lobby will be deleted for everyone." : "Are you sure you want to leave?",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: isHost ? "Delete & Leave" : "Leave", 
                  style: "destructive", 
                  onPress: async () => {
                      if (myParticipant) await leaveGame(game.$id, myParticipant.$id, isHost);
                      router.replace("/(tabs)" as any);
                  }
              }
          ]
      );
  };

  const renderParticipantItem = useCallback(({ item }: { item: GameParticipant }) => {
      return <ParticipantItem item={item} isHost={item.user_id === game?.host_id} contentType={game?.content_type || 'movie'} />;
  }, [game?.host_id, game?.content_type]);

  const renderGenreItem = useCallback(({ item }: { item: any }) => {
      const isSelected = selectedGenres.includes(item.id);
      return <GenreItem item={item} isSelected={isSelected} onPress={() => toggleGenre(item.id)} />;
  }, [selectedGenres, toggleGenre]);


  if (!game) return <View className="flex-1 bg-[#1E1E2D] justify-center items-center"><ActivityIndicator size="large" color="#FF9C01" /></View>;

  const isHost = game.host_id === user?.$id;
  const myParticipant = participants.find(p => p.user_id === user?.$id);
  const amIReady = myParticipant?.is_ready;
  const hasMinPlayers = participants.length >= 2;
  const allReady = participants.length > 0 && participants.every(p => p.is_ready);
  const canStart = allReady && hasMinPlayers;
  const activeProviderIds = JSON.parse(game.providers || '[]');
  const activeProvidersCount = activeProviderIds.length;
  const genresData = (game.content_type || 'movie') === 'tv' ? TV_GENRES : MOVIE_GENRES;

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 p-4">
        
        <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handleLeaveLobby}>
                <Image source={icons.left_arrow} className="w-5 h-5" tintColor="gray" />
            </TouchableOpacity>
            {isHost && (
                <TouchableOpacity onPress={() => setSettingsModalVisible(true)} style={styles.safeSettingsButton}>
                    <Image source={icons.menu} className="w-5 h-5" tintColor="white" /> 
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity onPress={copyToClipboard} activeOpacity={0.7} className="items-center mt-2 mb-6">
            <Text className="text-gray-400 uppercase tracking-widest text-xs mb-1">Room Code</Text>
            <View className="flex-row items-center justify-center gap-3">
                <Text className="text-5xl font-black text-secondary tracking-widest">{game?.game_code || "..."}</Text>
                <View className="bg-white/10 p-2 rounded-full"><Image source={icons.copy} className="w-4 h-4" tintColor="#FF9C01" /></View>
            </View>
        </TouchableOpacity>

        <View className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 flex-row justify-between items-center">
            <View>
                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">Game Mode</Text>
                <View className="flex-row items-center gap-2">
                    <Image source={game.content_type === 'movie' ? icons.clapperboard : icons.screen} className="w-4 h-4" tintColor="#FF9C01" />
                    <Text className="text-white font-bold text-lg capitalize">{game.content_type === 'movie' ? "Movies" : "TV Series"}</Text>
                </View>
            </View>
            <View className="items-end">
                <Text className="text-gray-400 text-xs uppercase font-bold mb-1">Providers</Text>
                <Text className="text-white font-bold text-lg">{activeProvidersCount === 0 ? "All" : `${activeProvidersCount} Selected`}</Text>
            </View>
        </View>

        {!amIReady && (
            <TouchableOpacity onPress={() => { setSelectedGenres([]); setGenreModalVisible(true); }} className="w-full bg-secondary p-4 rounded-xl items-center shadow-lg shadow-orange-500/20 mb-6">
                <Text className="text-primary font-black text-lg uppercase">Pick Genres</Text>
                <Text className="text-primary/70 text-xs font-bold">Action Required</Text>
            </TouchableOpacity>
        )}

        <Text className="text-white font-bold text-xl mb-4 ml-2">Players ({participants.length})</Text>
        <FlatList data={participants} keyExtractor={item => item.$id} renderItem={renderParticipantItem} scrollEnabled={true} />

        {isHost && (
            <TouchableOpacity onPress={handleStartGame} disabled={loading || !canStart} style={[styles.safeStartButton, canStart ? styles.safeStartButtonActive : styles.safeStartButtonInactive]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.safeStartButtonText}>{!hasMinPlayers ? "Need 2+ Players" : (allReady ? "Start Game" : "Waiting for picks...")}</Text>}
            </TouchableOpacity>
        )}

        <Modal visible={isGenreModalVisible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#1E1E2D] p-5">
                <Text className="text-white text-2xl font-bold mb-2 mt-4">Select Genres</Text>
                <Text className="text-gray-400 mb-6">Pick exactly <Text className="text-secondary font-bold">{game.genres_required_count}</Text> {game.content_type === 'tv' ? 'TV' : 'movie'} genres.</Text>
                <FlatList data={genresData} numColumns={2} columnWrapperStyle={{ justifyContent: 'space-between' }} keyExtractor={(item) => item.id.toString()} renderItem={renderGenreItem} />
                <TouchableOpacity onPress={handleSubmitGenres} disabled={selectedGenres.length !== game.genres_required_count} className={`w-full p-4 rounded-xl items-center mt-4 mb-8 ${selectedGenres.length === game.genres_required_count ? 'bg-secondary' : 'bg-gray-700'}`}><Text className="text-primary font-black text-lg">Confirm Selection</Text></TouchableOpacity>
            </View>
        </Modal>

        <Modal visible={isSettingsModalVisible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#1E1E2D] p-5">
                <View className="flex-row justify-between items-center mt-4 mb-6">
                    <Text className="text-white text-2xl font-bold">Lobby Settings</Text>
                    <TouchableOpacity onPress={() => setSettingsModalVisible(false)}><Text className="text-gray-400 font-bold">Cancel</Text></TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Content Type</Text>
                    <View className="flex-row gap-4 mb-8">
                        <TouchableOpacity onPress={() => setEditContentType('movie')} className={`flex-1 p-4 rounded-xl border-2 items-center ${editContentType === 'movie' ? 'bg-secondary/20 border-secondary' : 'bg-black-100 border-gray-700'}`}><Text className={`font-bold ${editContentType === 'movie' ? 'text-secondary' : 'text-gray-400'}`}>Movies</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditContentType('tv')} className={`flex-1 p-4 rounded-xl border-2 items-center ${editContentType === 'tv' ? 'bg-secondary/20 border-secondary' : 'bg-black-100 border-gray-700'}`}><Text className={`font-bold ${editContentType === 'tv' ? 'text-secondary' : 'text-gray-400'}`}>TV Series</Text></TouchableOpacity>
                    </View>
                    
                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Game Config</Text>
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-white mb-2">Genres / Player</Text>
                            <TextInput value={editGenresCount} onChangeText={setEditGenresCount} keyboardType="numeric" className="bg-black-100 text-white p-4 rounded-xl border border-gray-700 font-bold" />
                        </View>
                        <View className="flex-1 justify-center">
                             <Text className="text-gray-500 font-bold text-xs italic">Rounds are fixed to 4 in Funnel Mode.</Text>
                        </View>
                    </View>

                    <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Streaming Providers</Text>
                    <View className="flex-row flex-wrap gap-2 pb-10">
                        {Object.entries(WATCH_PROVIDERS).map(([key, value]) => {
                            const id = value as number; 
                            const isSelected = editProviders.includes(id);
                            return (<TouchableOpacity key={id} onPress={() => toggleEditProvider(id)} className={`px-4 py-3 rounded-lg border ${isSelected ? "bg-secondary border-secondary" : "bg-black-100 border-gray-700"}`}><Text className={`font-bold text-xs ${isSelected ? "text-primary" : "text-gray-300"}`}>{key.replace("_", " ")}</Text></TouchableOpacity>);
                        })}
                    </View>
                </ScrollView>
                <TouchableOpacity onPress={saveSettings} disabled={loading} className="w-full bg-secondary p-4 rounded-xl items-center mb-8"><Text className="text-primary font-black text-lg">Save Changes</Text></TouchableOpacity>
            </View>
        </Modal>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
    genreItem: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    genreItemSelected: { backgroundColor: '#FF9C01', borderColor: '#FF9C01' },
    genreItemUnselected: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' },
    genreText: { textAlign: 'center', fontWeight: 'bold' },
    genreTextSelected: { color: '#161622' },
    genreTextUnselected: { color: '#D1D5DB' },
    participantItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#4B5563' },
    nickname: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    hostBadge: { color: '#FF9C01', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
    genresText: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    statusReady: { backgroundColor: 'rgba(74, 222, 128, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.5)' },
    statusReadyText: { color: '#4ADE80', fontWeight: 'bold', fontSize: 12 },
    statusPicking: { backgroundColor: 'rgba(234, 179, 8, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.5)' },
    statusPickingText: { color: '#EAB308', fontWeight: 'bold', fontSize: 12 },
    safeSettingsButton: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 9999 },
    safeStartButton: { width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4.65, elevation: 8 },
    safeStartButtonActive: { backgroundColor: '#22c55e' },
    safeStartButtonInactive: { backgroundColor: '#374151' },
    safeStartButtonText: { color: 'white', fontWeight: '900', fontSize: 18, textTransform: 'uppercase' }
});

export default MultiplayerLobby;