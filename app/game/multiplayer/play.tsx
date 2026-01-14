import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
    GameParticipant,
    GameState,
    getGame,
    getGameParticipants,
    nextRoundOrFinish,
    submitRoundVotes,
    subscribeToGame,
    subscribeToParticipants
} from "@/services/gameService";

cssInterop(LinearGradient, { className: "style" });

const MultiplayerPlay = () => {
    const { user } = useGlobalContext();
    const router = useRouter();
    const { gameId } = useLocalSearchParams();

    // --- STATE ---
    const [game, setGame] = useState<GameState | null>(null);
    // REF: Kluczowy do poprawnego działania Realtime (zapobiega "stale closures")
    const gameRef = useRef<GameState | null>(null);
    
    const [participants, setParticipants] = useState<GameParticipant[]>([]);
    
    // Pula filmów widoczna dla TEGO konkretnego gracza
    const [myMoviesPool, setMyMoviesPool] = useState<any[]>([]);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedMovies, setLikedMovies] = useState<number[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [processingRound, setProcessingRound] = useState(false);

    // --- LOGIKA LIMITU (QUOTA) ---
    // Np. 5 rund -> R1: 5 like'ów, R2: 4 like'i ... R5: 1 like (Top 1)
    // Lub prościej: R1=5, R2=4, R3=3... ale nie mniej niż 1.
    const maxLikes = game ? Math.max(1, (game.round_total - game.round_current + 2)) : 5; 
    // UWAGA: Możesz dostosować wzór. Tutaj dałem luźniejszy (+2). 
    // Jeśli chcesz ostro (Top 3 w finale), w handleSwipe jest dodatkowy check.
    
    const likesLeft = Math.max(0, maxLikes - likedMovies.length);

    // --- INIT ---
    useEffect(() => {
        if (!gameId) return;

        let unsubGame: any;
        let unsubParticipants: any;

        const initGame = async () => {
            try {
                // 1. Pobierz stan początkowy "na sztywno"
                const initialGame = await getGame(gameId as string);
                updateGameState(initialGame);
                
                const initialParticipants = await getGameParticipants(gameId as string);
                // Sortujemy po dacie dołączenia, żeby indeksy były stałe dla każdego gracza
                const sortedParticipants = initialParticipants.sort((a, b) => a.$createdAt.localeCompare(b.$createdAt));
                setParticipants(sortedParticipants as unknown as GameParticipant[]);

                // Oblicz moją pulę na start
                calculateMyPool(initialGame, sortedParticipants as unknown as GameParticipant[]);

                // 2. Subskrypcja Gry
                unsubGame = subscribeToGame(gameId as string, (updatedGame) => {
                    // Wykrycie zmiany rundy
                    if (gameRef.current && updatedGame.round_current > gameRef.current.round_current) {
                        handleNewRound(updatedGame);
                    }
                    
                    // Wykrycie końca gry
                    if (updatedGame.status === 'finished') {
                        router.replace({ pathname: "/game/multiplayer/results" as any, params: { gameId: updatedGame.$id } });
                        return;
                    }

                    updateGameState(updatedGame);
                    
                    // Fallback: jeśli weszliśmy w trakcie i nie mamy puli
                    if (myMoviesPool.length === 0 && updatedGame.movies_pool) {
                        calculateMyPool(updatedGame, participants);
                    }
                });

                // 3. Subskrypcja Uczestników
                unsubParticipants = subscribeToParticipants(gameId as string, (updatedList) => {
                    const sorted = updatedList.sort((a, b) => a.$createdAt.localeCompare(b.$createdAt));
                    setParticipants(sorted);
                    checkIfAllReady(sorted);
                });

            } catch (error) {
                console.error("Init Error:", error);
                Alert.alert("Error", "Connection lost");
            }
        };

        initGame();

        return () => {
            if (unsubGame) unsubGame();
            if (unsubParticipants) unsubParticipants();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]); 

    const updateGameState = (newState: GameState) => {
        setGame(newState);
        gameRef.current = newState;
    };

    // --- LOGIKA "LEJKA" (KTO WIDZI JAKIE FILMY) ---
    const calculateMyPool = (gameState: GameState, currentParticipants: GameParticipant[]) => {
        if (!user || !gameState.movies_pool) return;
        
        let allMovies: any[] = [];
        try {
            allMovies = JSON.parse(gameState.movies_pool);
        } catch (e) {
            console.error("JSON Parse Error", e);
            return;
        }

        // RUNDA 1: Dzielimy pulę na części. Każdy dostaje swoje unikalne filmy.
        if (gameState.round_current === 1 && currentParticipants.length > 0) {
            const myIndex = currentParticipants.findIndex(p => p.user_id === user.$id);
            if (myIndex !== -1) {
                // Gracz 1: index 0-10, Gracz 2: index 10-20 itd.
                const start = myIndex * 10;
                const end = start + 10;
                const mySlice = allMovies.slice(start, end);
                setMyMoviesPool(mySlice);
                return;
            }
        }
        
        // RUNDA 2+: Wszyscy widzą te same filmy (te, które przeszły selekcję)
        setMyMoviesPool(allMovies);
    };

    const handleNewRound = (newGameData: GameState) => {
        // Resetujemy widok gracza
        calculateMyPool(newGameData, participants);
        setCurrentIndex(0);
        setLikedMovies([]);
        setIsWaiting(false);
        setProcessingRound(false);
    };

    // --- HOST LOGIC ---
    const checkIfAllReady = async (currentParticipants: GameParticipant[]) => {
        const currentGame = gameRef.current;
        if (!currentGame || !user) return;
        
        // Tylko Host
        if (currentGame.host_id !== user.$id) return;
        
        // Blokady
        if (processingRound) return;
        if (currentGame.status === 'finished') return;

        const allReady = currentParticipants.every(p => p.is_ready);

        if (allReady && currentParticipants.length > 0) {
            setProcessingRound(true);
            try {
                // Obliczamy wyniki rundy
                await nextRoundOrFinish(currentGame.$id, currentGame.round_current, currentGame.round_total);
            } catch (error: any) {
                console.error("HOST ERROR:", error);
                setProcessingRound(false);
            }
        }
    };

    // --- USER ACTION ---
    const handleSwipe = async (liked: boolean) => {
        const currentMovie = myMoviesPool[currentIndex];
        const isLastRound = game?.round_current === game?.round_total;

        // --- BLOKADA LIMITU ---
        if (liked) {
            // Hard limit dla ostatniej rundy (Top 3)
            if (isLastRound && likedMovies.length >= 3) {
                Alert.alert("Final Round", "You can only pick your Top 3 favorites now. You must pass.");
                return;
            }
            // Limit dynamiczny dla wcześniejszych rund
            if (likesLeft <= 0) {
                Alert.alert("Limit Reached", `You used all ${maxLikes} picks for this round. You must pass.`);
                return;
            }
            
            setLikedMovies(prev => [...prev, currentMovie.id]);
        }

        // Czy to koniec filmów w mojej kolejce?
        if (currentIndex >= myMoviesPool.length - 1) {
            setIsWaiting(true);
            
            const myParticipantId = participants.find(p => p.user_id === user?.$id)?.$id;
            const currentGame = gameRef.current;

            if (myParticipantId && currentGame) {
                try {
                    const finalVotes = liked ? [...likedMovies, currentMovie.id] : likedMovies;
                    await submitRoundVotes(myParticipantId, currentGame.round_current, finalVotes);
                } catch { 
                    Alert.alert("Error", "Failed to submit votes.");
                    setIsWaiting(false);
                }
            }
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const currentMovie = myMoviesPool[currentIndex];

    // --- UI RENDER ---
    if (!game || !currentMovie) {
        return (
            <View className="flex-1 bg-[#1E1E2D] justify-center items-center">
                <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
                <ActivityIndicator size="large" color="#FF9C01" />
                <Text className="text-white mt-4 font-bold">
                    {isWaiting ? "Waiting for players..." : "Syncing game..."}
                </Text>
            </View>
        );
    }

    const isLastRound = game.round_current === game.round_total;

    return (
        <View className="flex-1 bg-[#1E1E2D]">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            <SafeAreaView className="flex-1 p-4">

                {/* HEADER */}
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Round</Text>
                        <Text className="text-secondary text-2xl font-black">
                            {game.round_current} <Text className="text-white text-base font-normal">/ {game.round_total}</Text>
                        </Text>
                    </View>
                    
                    {/* LICZNIK DOSTĘPNYCH LIKÓW */}
                    <View className="items-center">
                         <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Picks Available</Text>
                         <Text className={`text-3xl font-black ${likesLeft === 0 ? 'text-red-500' : 'text-green-400'}`}>
                            {likesLeft} <Text className="text-white text-base font-normal">/ {isLastRound ? 3 : maxLikes}</Text>
                         </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Queue</Text>
                        <Text className="text-white text-xl font-bold">
                            {myMoviesPool.length - currentIndex}
                        </Text>
                    </View>
                </View>

                {isWaiting ? (
                    <View className="flex-1 justify-center items-center bg-black/20 rounded-3xl border border-white/5 p-8">
                        <ActivityIndicator size="large" color="#FF9C01" className="mb-6" />
                        <Text className="text-white text-2xl font-bold text-center mb-2">Round Done!</Text>
                        <Text className="text-gray-400 text-center mb-8">Waiting for others...</Text>
                        
                        <View className="w-full">
                            {participants.map(p => (
                                <View key={p.$id} className="flex-row items-center justify-between mb-3 bg-white/5 p-3 rounded-xl">
                                    <View className="flex-row items-center">
                                        <Image 
                                            source={{ uri: p.avatar_url || "https://cloud.appwrite.io/v1/avatars/initials?name=" + p.nickname }} 
                                            className="w-8 h-8 rounded-full mr-3 bg-gray-600" 
                                        />
                                        <Text className="text-white font-bold">{p.nickname}</Text>
                                    </View>
                                    {p.is_ready ? (
                                        <Text className="text-green-400 font-bold text-xs">READY</Text>
                                    ) : (
                                        <Text className="text-yellow-500 font-bold text-xs">VOTING...</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 justify-center items-center">
                        <View className="w-full aspect-[2/3] bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-xl relative">
                            {currentMovie.poster_path ? (
                                <Image
                                    source={{ uri: `https://image.tmdb.org/t/p/w780${currentMovie.poster_path}` }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full bg-gray-800 justify-center items-center">
                                    <Text className="text-white">No Poster</Text>
                                </View>
                            )}
                            
                            {/* GRADIENT + TEXT */}
                            <LinearGradient 
                                colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} 
                                className="absolute bottom-0 w-full h-64 justify-end p-6"
                            >
                                <Text className="text-white text-3xl font-black shadow-black drop-shadow-lg" numberOfLines={2}>
                                    {currentMovie.title}
                                </Text>
                                
                                <Text className="text-secondary font-bold mt-1 mb-2">
                                    {currentMovie.release_date?.split('-')[0]} • ⭐ {currentMovie.vote_average.toFixed(1)}
                                </Text>

                                <Text 
                                    className="text-gray-300 text-xs font-medium leading-5 opacity-90" 
                                    numberOfLines={3} 
                                >
                                    {currentMovie.overview || "No description available."}
                                </Text>
                            </LinearGradient>
                        </View>

                        <View className="flex-row justify-center gap-8 mt-8 w-full">
                            <TouchableOpacity 
                                onPress={() => handleSwipe(false)}
                                className="bg-[#1E1E2D] p-5 rounded-full border-2 border-red-500/50 shadow-lg shadow-red-500/20 active:scale-95"
                            >
                                <Image source={icons.close} className="w-8 h-8" tintColor="#EF4444" />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => handleSwipe(true)}
                                disabled={likesLeft <= 0}
                                className={`p-5 rounded-full shadow-lg active:scale-95 scale-110 ${likesLeft <= 0 ? 'bg-gray-600 opacity-50' : 'bg-secondary shadow-orange-500/40'}`}
                            >
                                <Image source={icons.heart} className="w-10 h-10" tintColor="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};

export default MultiplayerPlay;