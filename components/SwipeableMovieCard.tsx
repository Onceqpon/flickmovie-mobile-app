import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import React from "react";
import { Dimensions, Image, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

cssInterop(LinearGradient, { className: "style" });

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% ekranu, żeby zaliczyć przesunięcie

interface SwipeableMovieCardProps {
    movie: any;
    onSwipe: (liked: boolean) => void;
    canLike: boolean; // Czy użytkownik może dać LIKE (czy ma jeszcze dostępne wybory)
}

const SwipeableMovieCard = ({ movie, onSwipe, canLike }: SwipeableMovieCardProps) => {
    // Wartości animowane (pozycja i obrót)
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    // Logika gestu
    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY * 0.2; // Lekki ruch w pionie dla naturalności
            rotation.value = event.translationX / 20;    // Lekki obrót
        })
        .onEnd(() => {
            // Sprawdzamy czy przesunięto wystarczająco daleko
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                const liked = translateX.value > 0;

                // --- ZABEZPIECZENIE ---
                // Jeśli user próbuje dać LIKE (prawo), ale canLike jest false -> WRACAMY
                if (liked && !canLike) {
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                    rotation.value = withSpring(0);
                    return; 
                }

                // Animacja wylotu poza ekran (w prawo lub w lewo)
                translateX.value = withTiming(liked ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5, { duration: 250 });
                
                // Wywołanie funkcji z logiką gry (wątek JS)
                runOnJS(onSwipe)(liked);
            } else {
                // Powrót na środek (anulowanie ruchu)
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                rotation.value = withSpring(0);
            }
        });

    // Style transformacji podpięte pod wartości animowane
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` }
        ],
    }));

    // Style stempli (Overlay "LIKE" / "NOPE")
    const likeOpacity = useAnimatedStyle(() => ({
        opacity: translateX.value > 0 ? translateX.value / 100 : 0
    }));
    const nopeOpacity = useAnimatedStyle(() => ({
        opacity: translateX.value < 0 ? -translateX.value / 100 : 0
    }));

    // Pobieramy rok produkcji
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 
                        (movie.first_air_date ? movie.first_air_date.split('-')[0] : "N/A");

    return (
        <GestureHandlerRootView style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[animatedStyle, { width: '100%', aspectRatio: 2/3 }]}>
                    
                    {/* --- KARTA FILMU --- */}
                    <View className="w-full h-full bg-[#1E1E2D] rounded-3xl overflow-hidden border-2 border-white/10 shadow-xl relative">
                        {movie.poster_path ? (
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w780${movie.poster_path}` }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full justify-center items-center bg-gray-800">
                                <Text className="text-white font-bold">No Poster Available</Text>
                            </View>
                        )}

                        {/* Gradient na dole dla czytelności tekstu */}
                        <LinearGradient 
                            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} 
                            className="absolute bottom-0 w-full h-72 justify-end p-6"
                        >
                            <Text className="text-white text-3xl font-black shadow-black drop-shadow-lg" numberOfLines={2}>
                                {movie.title || movie.name}
                            </Text>
                            <Text className="text-secondary font-bold mt-1 mb-2 text-lg">
                                {releaseYear} • ⭐ {movie.vote_average?.toFixed(1)}
                            </Text>
                            <Text className="text-gray-300 text-sm font-medium leading-5 opacity-90" numberOfLines={3}>
                                {movie.overview || "No description available."}
                            </Text>
                        </LinearGradient>

                        {/* --- OVERLAYS (STEMPLE) --- */}
                        
                        {/* LIKE (Zielony, po lewej na górze) */}
                        <Animated.View style={[likeOpacity, { position: 'absolute', top: 40, left: 40, transform: [{ rotate: '-30deg' }] }]}>
                            <View className="border-4 border-green-500 rounded-xl px-4 py-2 bg-black/40">
                                <Text className="text-green-500 font-black text-4xl uppercase tracking-widest">LIKE</Text>
                            </View>
                        </Animated.View>

                        {/* NOPE (Czerwony, po prawej na górze) */}
                        <Animated.View style={[nopeOpacity, { position: 'absolute', top: 40, right: 40, transform: [{ rotate: '30deg' }] }]}>
                            <View className="border-4 border-red-500 rounded-xl px-4 py-2 bg-black/40">
                                <Text className="text-red-500 font-black text-4xl uppercase tracking-widest">NOPE</Text>
                            </View>
                        </Animated.View>

                    </View>
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

export default SwipeableMovieCard;