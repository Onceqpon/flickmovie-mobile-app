import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGlobalContext } from "@/context/GlobalProvider";
import {
    getGame,
    getGameParticipants,
    leaveGame,
    saveToHistory
} from "@/services/gameService";

cssInterop(LinearGradient, { className: "style" });

interface MovieResult {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    vote_average: number;
    release_date?: string;
    match_score: number;
    liked_by: string[];
}

const MultiplayerResults = () => {
    const { user } = useGlobalContext();
    const router = useRouter();
    const { gameId } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<MovieResult[]>([]);
    const [goldPick, setGoldPick] = useState<MovieResult | null>(null);
    
    const hasSaved = useRef(false);

    useEffect(() => {
        const fetchAndSaveResults = async () => {
            try {
                if (!gameId) return;

                const game = await getGame(gameId as string);
                const participants = await getGameParticipants(gameId as string);

                const finalMovies = JSON.parse(game.movies_pool || '[]');

                const scoredMovies = finalMovies.map((movie: any) => {
                    let totalScore = 0;
                    let likedByAvatars: string[] = [];

                    participants.forEach((p) => {
                        const votesMap = JSON.parse(p.votes || '{}');
                        const allUserVotes = Object.values(votesMap).flat();
                        
                        const votesForThisMovie = allUserVotes.filter((id: any) => String(id) === String(movie.id)).length;
                        
                        totalScore += votesForThisMovie;

                        if (votesForThisMovie > 0) {
                            likedByAvatars.push(p.avatar_url || `https://cloud.appwrite.io/v1/avatars/initials?name=${p.nickname}`);
                        }
                    });

                    return { 
                        ...movie, 
                        match_score: totalScore, 
                        liked_by: likedByAvatars 
                    };
                });

                const sorted = scoredMovies.sort((a: MovieResult, b: MovieResult) => {
                    if (b.match_score !== a.match_score) {
                        return b.match_score - a.match_score;
                    }
                    return b.vote_average - a.vote_average;
                });

                const topPicks = sorted.slice(0, 4);

                if (topPicks.length > 0) {
                    if (topPicks[0].match_score > 1) {
                        setGoldPick(topPicks[0]);
                        setResults(topPicks.slice(1)); 
                    } else {
                        setGoldPick(null);
                        setResults(topPicks); 
                    }
                } else {
                    setResults([]);
                }

                if (user && !hasSaved.current) {
                    hasSaved.current = true;
                    
                    await saveToHistory(user.$id, topPicks, 'multiplayer');
                    
                    if (game.host_id === user.$id) {
                        try {
                            const myPart = participants.find(p => p.user_id === user.$id);
                            if (myPart) {
                                await leaveGame(gameId as string, myPart.$id, true);
                            }
                        } catch (err) {
                            console.log("Game already deleted or cleanup failed:", err);
                        }
                    }
                }

            } catch (error: any) {
                if (!error.message?.includes('404')) {
                    Alert.alert("Error", error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAndSaveResults();
    }, [gameId, user]);

    const handleHome = () => {
        router.replace("/(tabs)" as any);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#1E1E2D] justify-center items-center">
                <ActivityIndicator size="large" color="#FF9C01" />
                <Text className="text-white mt-4 font-bold">Calculating matches...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#1E1E2D]">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            <SafeAreaView className="flex-1 p-4">
                
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    
                    <View className="items-center mt-4 mb-8">
                        <Text className="text-3xl font-black text-white text-center tracking-wider">
                            {goldPick ? "IT'S A MATCH! 🎉" : "RESULTS"}
                        </Text>
                        <Text className="text-gray-400 text-center mt-1 font-medium">
                            {goldPick ? "This is your group's top pick!" : "Here is how everyone voted."}
                        </Text>
                    </View>

                    {goldPick && (
                        <View className="items-center mb-10 shadow-xl shadow-orange-500/20">
                            <LinearGradient
                                colors={['#FF9C01', '#FFD700', '#FF9C01']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                className="p-[3px] rounded-[24px] w-full"
                            >
                                <View className="bg-[#161622] rounded-[21px] overflow-hidden">
                                    <Image 
                                        source={{ uri: `https://image.tmdb.org/t/p/w780${goldPick.poster_path}` }} 
                                        className="w-full h-96"
                                        resizeMode="cover"
                                    />
                                    
                                    <LinearGradient 
                                        colors={['transparent', 'rgba(0,0,0,0.9)']} 
                                        className="absolute bottom-0 w-full h-44 justify-end p-5"
                                    >
                                        <View className="flex-row justify-between items-start w-full mb-2">
                                            <View className="bg-secondary px-3 py-1 rounded-lg">
                                                <Text className="text-[#161622] font-black text-xs uppercase">🏆 Most Voted</Text>
                                            </View>
                                            <View className="bg-white/10 px-3 py-1 rounded-lg">
                                                <Text className="text-white font-bold text-xs">⭐ {goldPick.vote_average.toFixed(1)}</Text>
                                            </View>
                                        </View>
                                        
                                        <Text className="text-white text-3xl font-black text-center mb-1" numberOfLines={2}>
                                            {goldPick.title || goldPick.name}
                                        </Text>
                                        
                                        <View className="flex-row justify-center items-center mt-3">
                                            {goldPick.liked_by.map((uri, index) => (
                                                <Image 
                                                    key={index} 
                                                    source={{ uri }} 
                                                    className={`w-8 h-8 rounded-full border-2 border-[#161622] ${index > 0 ? '-ml-2' : ''}`}
                                                />
                                            ))}
                                            <Text className="text-secondary text-lg font-black ml-3">
                                                {goldPick.match_score} Total Votes
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </View>
                            </LinearGradient>
                        </View>
                    )}

                    {results.length > 0 && (
                        <View>
                            <Text className="text-white font-bold text-xl mb-4 ml-2 uppercase tracking-widest">
                                {goldPick ? "Runner Ups" : "Ranked Picks"}
                            </Text>
                            
                            {results.map((item, index) => (
                                <View 
                                    key={item.id} 
                                    className="flex-row bg-white/5 rounded-2xl mb-4 p-3 border border-white/5 items-center"
                                >
                                    <Text className="text-gray-500 font-black text-xl mr-4 ml-2 opacity-50 w-6 text-center">
                                        #{goldPick ? index + 2 : index + 1}
                                    </Text>

                                    <Image 
                                        source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }} 
                                        className="w-16 h-24 rounded-xl bg-gray-700"
                                        resizeMode="cover"
                                    />

                                    <View className="flex-1 ml-4 justify-center">
                                        <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
                                            {item.title || item.name}
                                        </Text>
                                        
                                        <Text className="text-gray-400 text-xs mb-3">
                                            ⭐ {item.vote_average.toFixed(1)} • {item.release_date?.split('-')[0]}
                                        </Text>

                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row">
                                                {item.liked_by.length > 0 ? (
                                                    item.liked_by.map((uri, idx) => (
                                                        <Image 
                                                            key={idx} 
                                                            source={{ uri }} 
                                                            className={`w-6 h-6 rounded-full border border-[#1E1E2D] ${idx > 0 ? '-ml-2' : ''}`} 
                                                        />
                                                    ))
                                                ) : (
                                                    <Text className="text-gray-600 text-xs italic">No votes</Text>
                                                )}
                                            </View>
                                            
                                            <View className="bg-white/10 px-2 py-1 rounded-md">
                                                <Text className="text-white font-bold text-xs">
                                                    {item.match_score} Votes
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                </ScrollView>

                <TouchableOpacity 
                    onPress={handleHome}
                    className="w-full bg-secondary p-4 rounded-2xl items-center shadow-lg shadow-orange-500/20 mb-2"
                >
                    <Text className="text-primary font-black text-lg">Back to Home</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
};

export default MultiplayerResults;