import { LinearGradient } from 'expo-linear-gradient'; // 1. Import
import { Link, router } from 'expo-router';
import { cssInterop } from "nativewind"; // 2. Import
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGlobalContext } from '@/context/GlobalProvider';
import { getCurrentUser, signIn } from '@/services/appwriteapi';

// 3. Konfiguracja NativeWind
cssInterop(LinearGradient, {
  className: "style",
});

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();

      if (result) {
        setUser(result);
        setIsLogged(true);
        Alert.alert("Success", "User signed in successfully");
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 4. Główny kontener View z fallbackiem koloru
    <View className="flex-1 bg-[#1E1E2D]">
      
      {/* 5. Gradient Tła */}
      <LinearGradient
          colors={["#000C1C", "#161622", "#1E1E2D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 h-full w-full"
      />

      <SafeAreaView className="flex-1">
        <ScrollView>
          <View className="w-full justify-center min-h-[85vh] px-4 my-6">
            <View className="w-full justify-center items-center">
              <Text className="text-5xl text-white font-black text-center tracking-wider mt-20 mb-5 ">
                  FLICK<Text className="text-secondary">MOVIE</Text>
               </Text>
            </View>

            <Text className="text-2xl text-white font-semibold mt-10 font-psemibold">
              Sign in to FlickMovie
            </Text>

            <View className="space-y-2 mt-7">
              <Text className="text-base text-gray-100 font-pmedium">Email</Text>
              <View className="w-full h-16 px-4 bg-black-100 border-2 border-secondary rounded-2xl items-center flex-row">
                <TextInput
                  className="flex-1 text-white font-psemibold text-base"
                  value={form.email}
                  placeholder="Enter your email"
                  placeholderTextColor="#7b7b8b"
                  onChangeText={(e) => setForm({ ...form, email: e })}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="space-y-2 mt-7">
              <Text className="text-base text-gray-100 font-pmedium">Password</Text>
              <View className="w-full h-16 px-4 bg-black-100 border-2  rounded-2xl border-secondary items-center flex-row">
                <TextInput
                  className="flex-1 text-white font-psemibold text-base"
                  value={form.password}
                  placeholder="Enter your password"
                  placeholderTextColor="#7b7b8b"
                  onChangeText={(e) => setForm({ ...form, password: e })}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={submit}
              activeOpacity={0.7}
              className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center mt-7 ${isSubmitting ? 'opacity-50' : ''}`}
              disabled={isSubmitting}
            >
              <Text className="text-primary font-bold text-lg">Sign In</Text>
            </TouchableOpacity>

            <View className="justify-center pt-5 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Don t have an account?
              </Text>
              <Link href="/sign-up" className="text-lg font-psemibold text-secondary">
                Sign Up
              </Link>
            </View>
            
            <View className="justify-center flex-row gap-2 mt-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Or
              </Text>
            </View>
            
            <View className="justify-center flex-row gap-2 mt-2">
              <Link href="/(tabs)" className="text-lg font-psemibold text-secondary">
                Continue as a guest
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignIn;