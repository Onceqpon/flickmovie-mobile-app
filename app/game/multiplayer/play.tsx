import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SwipeableMovieCard from "@/components/SwipeableMovieCard";
import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
    GameParticipant,
    GameState,
    getGame,
    getGameParticipants,
    leaveGame,
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

    const [game, setGame] = useState<GameState | null>(null);
    const gameRef = useRef<GameState | null>(null);
    
    const [participants, setParticipants] = useState<GameParticipant[]>([]);
    const participantsRef = useRef<GameParticipant[]>([]);

    const [myMoviesPool, setMyMoviesPool] = useState<any[]>([]);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedMovies, setLikedMovies] = useState<number[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [processingRound, setProcessingRound] = useState(false);

    const getMaxLikes = (round: number, playersCount: number) => {
        switch (round) {
            case 1: return 5;
            case 2: return playersCount > 2 ? 4 : 3; 
            case 3: return 2;
            case 4: return 1;
            default: return 1;
        }
    };

    const maxLikes = game ? getMaxLikes(game.round_current, participants.length) : 1;
    const likesLeft = Math.max(0, maxLikes - likedMovies.length);
    const canLike = likesLeft > 0;

    useEffect(() => {
        if (!gameId) return;
        let unsubGame: any;
        let unsubParticipants: any;

        const initGame = async () => {
            try {
                const initialGame = await getGame(gameId as string);
                updateGameState(initialGame);
                
                const initialParticipants = await getGameParticipants(gameId as string);
                const sortedParticipants = initialParticipants.sort((a, b) => a.$createdAt.localeCompare(b.$createdAt));
                
                setParticipants(sortedParticipants as unknown as GameParticipant[]);
                participantsRef.current = sortedParticipants as unknown as GameParticipant[];

                calculateMyPool(initialGame, sortedParticipants as unknown as GameParticipant[]);

                unsubGame = subscribeToGame(gameId as string, (updatedGame) => {
                    if (!updatedGame) {
                        Alert.alert("Game Ended", "The host has ended the game.");
                        router.replace("/(tabs)/home" as any);
                        return;
                    }

                    if (gameRef.current && updatedGame.round_current > gameRef.current.round_current) {
                        handleNewRound(updatedGame, participantsRef.current);
                    }
                    if (updatedGame.status === 'finished') {
                        router.replace({ pathname: "/game/multiplayer/results" as any, params: { gameId: updatedGame.$id } });
                        return;
                    }
                    updateGameState(updatedGame);
                    
                    if (myMoviesPool.length === 0 && updatedGame.movies_pool) {
                        calculateMyPool(updatedGame, participantsRef.current);
                    }
                });

                unsubParticipants = subscribeToParticipants(gameId as string, (updatedList) => {
                    if (!updatedList || updatedList.length === 0) {
                         Alert.alert("Game Ended", "The lobby was closed.");
                         router.replace("/(tabs)/home" as any);
                         return;
                    }

                    const sorted = updatedList.sort((a, b) => a.$createdAt.localeCompare(b.$createdAt));
                    setParticipants(sorted);
                    participantsRef.current = sorted;
                    
                    const hostStillInGame = sorted.some(p => p.user_id === gameRef.current?.host_id);
                    if (!hostStillInGame && gameRef.current) {
                        Alert.alert("Game Over", "The host left the game.");
                        router.replace("/(tabs)/home" as any);
                        return;
                    }

                    if (sorted.length < 2 && gameRef.current?.status === 'in_progress') {
                        Alert.alert("Game Over", "Not enough players to continue.");
                        router.replace("/(tabs)/home" as any);
                        return;
                    }
                    checkIfAllReady(sorted);
                });
            } catch (error: any) {
                if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                    Alert.alert("Game Ended", "The host ended the game.");
                    router.replace("/(tabs)/home" as any);
                }
            }
        };

        initGame();
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => { handleLeaveGame(); return true; });
        return () => { if (unsubGame) unsubGame(); if (unsubParticipants) unsubParticipants(); backHandler.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]); 

    const updateGameState = (newState: GameState) => { setGame(newState); gameRef.current = newState; };
    
    const calculateMyPool = (gameState: GameState, currentParticipants: GameParticipant[]) => {
        if (!user || !gameState.movies_pool) return;
        
        let allMovies: any[] = [];
        try { allMovies = JSON.parse(gameState.movies_pool); } catch (e) { return; }

        if (gameState.round_current === 1) {
            const myIndex = currentParticipants.findIndex(p => p.user_id === user.$id);
            if (myIndex !== -1) {
                const cardsPerPlayer = 10;
                const start = myIndex * cardsPerPlayer;
                const end = start + cardsPerPlayer;
                setMyMoviesPool(allMovies.slice(start, end));
                return;
            }
        } else if (gameState.round_current === 2) {
            const myParticipant = currentParticipants.find(p => p.user_id === user.$id);
            if (myParticipant) {
                const myVotes = JSON.parse(myParticipant.votes || '{}');
                const myRound1Votes = myVotes['round_1'] || [];
                
                const filteredPool = allMovies.filter((m: any) => {
                    const iVotedForThis = myRound1Votes.some((voteId: any) => String(voteId) === String(m.id));
                    return !iVotedForThis; 
                });
                setMyMoviesPool(filteredPool);
                return;
            }
        }
        setMyMoviesPool(allMovies);
    };

    const handleNewRound = (newGameData: GameState, currentParticipants: GameParticipant[]) => { 
        calculateMyPool(newGameData, currentParticipants); 
        setCurrentIndex(0); 
        setLikedMovies([]); 
        setIsWaiting(false); 
        setProcessingRound(false); 
    };

    const checkIfAllReady = async (currentParticipants: GameParticipant[]) => {
        const currentGame = gameRef.current;
        if (!currentGame || !user) return;
        if (currentGame.host_id !== user.$id) return;
        if (processingRound) return;
        if (currentGame.status === 'finished') return;
        
        const allReady = currentParticipants.every(p => p.is_ready);
        if (allReady && currentParticipants.length > 0) {
            setProcessingRound(true);
            try { await nextRoundOrFinish(currentGame.$id, currentGame.round_current, 4); } 
            catch (error) { setProcessingRound(false); }
        }
    };

    const submitVotes = async (finalVotes: number[]) => {
        setIsWaiting(true);
        const myParticipantId = participantsRef.current.find(p => p.user_id === user?.$id)?.$id;
        const currentGame = gameRef.current;
        if (myParticipantId && currentGame) {
            try { await submitRoundVotes(myParticipantId, currentGame.round_current, finalVotes); }
            catch (error) { setIsWaiting(false); Alert.alert("Error", "Try again."); }
        }
    };

    const handleSwipe = async (liked: boolean) => {
        const currentMovie = myMoviesPool[currentIndex];

        if (liked && !canLike) { 
            Alert.alert("Limit Reached", `You can only pick ${maxLikes} movies in this round.`); 
            return; 
        }

        const newLikedMovies = liked ? [...likedMovies, currentMovie.id] : likedMovies;
        setLikedMovies(newLikedMovies);

        const hasUsedAllPicks = newLikedMovies.length >= maxLikes;
        const isLastCard = currentIndex >= myMoviesPool.length - 1;

        if (hasUsedAllPicks) {
            await submitVotes(newLikedMovies);
        } else if (isLastCard) {
            const remainingMovies = myMoviesPool.filter(m => !newLikedMovies.includes(m.id));
            
            if (remainingMovies.length === 0) {
                await submitVotes(newLikedMovies);
            } else {
                setMyMoviesPool(remainingMovies);
                setCurrentIndex(0);
                Alert.alert("Round Incomplete", `You still need to pick ${maxLikes - newLikedMovies.length} more movies. Reviewing passed titles.`);
            }
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleLeaveGame = () => {
        Alert.alert("Leave Game?", "This ends the game for everyone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Leave", style: "destructive", onPress: async () => {
                if (game && user) {
                    const isHost = game.host_id === user.$id;
                    const myPart = participantsRef.current.find(p => p.user_id === user.$id);
                    if (myPart) await leaveGame(game.$id, myPart.$id, isHost);
                }
                router.replace("/(tabs)/home" as any);
            }}
        ]);
    };

    const currentMovie = myMoviesPool[currentIndex];

    if (!game || !currentMovie) {
        return (
            <View className="flex-1 bg-[#1E1E2D] justify-center items-center">
                <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
                <ActivityIndicator size="large" color="#FF9C01" />
                <Text className="text-white mt-4 font-bold">{isWaiting ? "Waiting for players..." : "Syncing..."}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#1E1E2D]">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            <SafeAreaView className="flex-1 p-4 pb-8">
                <View className="flex-row justify-between items-center mb-4 z-10">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Round</Text>
                        <Text className="text-secondary text-2xl font-black">
                            {game.round_current} <Text className="text-white text-base font-normal">/ 4</Text>
                        </Text>
                    </View>
                    
                    <View className="items-center">
                         <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Picks Left</Text>
                         <Text className={`text-3xl font-black ${likesLeft === 0 ? 'text-red-500' : 'text-green-400'}`}>
                            {likesLeft} <Text className="text-white text-base font-normal">/ {maxLikes}</Text>
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
                                        <Image source={{ uri: p.avatar_url || `https://cloud.appwrite.io/v1/avatars/initials?name=${p.nickname}` }} className="w-8 h-8 rounded-full mr-3 bg-gray-600" />
                                        <Text className="text-white font-bold">{p.nickname}</Text>
                                    </View>
                                    <Text className={p.is_ready ? "text-green-400 font-bold text-xs" : "text-yellow-500 font-bold text-xs"}>{p.is_ready ? "READY" : "VOTING..."}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 justify-center items-center relative mt-4 mb-20">
                        <SwipeableMovieCard key={currentIndex} movie={currentMovie} onSwipe={handleSwipe} canLike={canLike} />
                        
                        <View className="flex-row justify-center items-center gap-24 w-full absolute -bottom-10">
                            
                            <TouchableOpacity 
                                onPress={() => handleSwipe(false)} 
                                activeOpacity={0.7} 
                                className="items-center justify-center p-4"
                            >
                                <Image 
                                    source={icons.close} 
                                    className="w-14 h-14" 
                                    tintColor="#EF4444" 
                                    style={{ shadowColor: '#EF4444', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.4, shadowRadius: 8 }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => canLike ? handleSwipe(true) : Alert.alert("No Picks Left", "You used all picks.")} 
                                activeOpacity={0.7}
                                disabled={!canLike}
                                className={`items-center justify-center p-4 ${!canLike ? 'opacity-30' : ''}`}
                            >
                                <Image 
                                    source={icons.heart} 
                                    className="w-14 h-14" 
                                    tintColor={!canLike ? "#6B7280" : "#22C55E"} 
                                    style={canLike ? { shadowColor: '#22C55E', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.4, shadowRadius: 8 } : {}}
                                />
                            </TouchableOpacity>

                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};

export default MultiplayerPlay;