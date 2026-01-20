import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";
import { joinGameByCode } from "@/services/gameService";

cssInterop(LinearGradient, { className: "style" });

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const JoinGameScreen = () => {
    const router = useRouter();
    const { user } = useGlobalContext();
    
    const [code, setCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const lockRef = useRef(false);

    const buttonScale = useSharedValue(1);
    const animatedButtonStyle = useAnimatedStyle(() => {
        return { transform: [{ scale: buttonScale.value }] };
    });

    const handlePressIn = () => { buttonScale.value = withSpring(0.9); };
    const handlePressOut = () => { buttonScale.value = withSpring(1); };

    const handleJoin = () => {
        if (lockRef.current) return;

        if (code.length < 6) {
            Alert.alert("Invalid Code", "Game code must be 6 digits.");
            return;
        }

        if (!user) return;

        lockRef.current = true;

        if (inputRef.current) {
            inputRef.current.blur();
        }
        Keyboard.dismiss();

        setTimeout(async () => {
            setIsJoining(true);

            try {
                await new Promise(resolve => setTimeout(resolve, 50));

                const game = await joinGameByCode(code, user.$id, user.name, (user.prefs as any).avatar);
                
                router.replace({ 
                    pathname: "/game/multiplayer/lobby", 
                    params: { gameId: game.$id } 
                });
            } catch (error: any) {
                setIsJoining(false);
                lockRef.current = false;
                
                setTimeout(() => {
                    Alert.alert("Error", error.message || "Failed to join game");
                }, 100);
            }
        }, 300);
    };

    if (isJoining) {
        return (
            <View className="flex-1 bg-[#1E1E2D] justify-center items-center">
                <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
                <View className="bg-secondary/10 p-8 rounded-full mb-8 border border-secondary/20 shadow-lg shadow-orange-500/10">
                    <ActivityIndicator size="large" color="#FF9C01" />
                </View>
                <Text className="text-white text-2xl font-black tracking-widest mb-2">JOINING...</Text>
                <Text className="text-gray-400 font-medium">Connecting to the lobby</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#1E1E2D]">
            <LinearGradient colors={["#000C1C", "#1E1E2D"]} className="absolute w-full h-full" />
            
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1"
                >
                    <ScrollView 
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="px-4 py-4">
                            <TouchableOpacity 
                                onPress={() => { if (!lockRef.current) router.back(); }} 
                                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/10"
                            >
                                <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 justify-center px-6 pb-20">
                            
                            <View className="items-center mb-10">
                                <View className="bg-secondary/10 p-6 rounded-full mb-6 border border-secondary/20 shadow-lg shadow-orange-500/10">
                                    <Image source={icons.search} className="w-10 h-10" tintColor="#FF9C01" />
                                </View>
                                <Text className="text-3xl font-black text-white text-center tracking-wider">JOIN PARTY</Text>
                                <Text className="text-gray-400 mt-2 text-center text-base">Enter the 6-digit code from the host</Text>
                            </View>

                            <View className="mb-16">
                                <Text className="text-gray-400 font-bold mb-3 ml-2 uppercase text-xs tracking-widest">Game Code</Text>
                                <View className={`bg-black/20 rounded-2xl border-2 transition-all ${isFocused ? 'border-secondary bg-black/40' : 'border-white/10'}`}>
                                    <TextInput
                                        ref={inputRef}
                                        value={code}
                                        onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="000000"
                                        placeholderTextColor="#4B5563"
                                        keyboardType="number-pad"
                                        editable={!isJoining} 
                                        className="text-white p-5 font-black text-4xl text-center tracking-[8px] w-full"
                                        selectionColor="#FF9C01"
                                    />
                                </View>
                            </View>

                            <AnimatedTouchableOpacity
                                onPress={handleJoin}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                activeOpacity={1} 
                                style={[animatedButtonStyle]}
                                disabled={isJoining || code.length < 6}
                                className={`w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg ${
                                    code.length < 6 
                                        ? "bg-gray-700 opacity-50" 
                                        : "bg-secondary shadow-orange-500/25"
                                }`}
                            >
                                <Text numberOfLines={1} className={`font-black text-lg uppercase tracking-wide ${code.length < 6 ? "text-gray-400" : "text-primary"}`}>
                                    JOIN LOBBY
                                </Text>
                            </AnimatedTouchableOpacity>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default JoinGameScreen;