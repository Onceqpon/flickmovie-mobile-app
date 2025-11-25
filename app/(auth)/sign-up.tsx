import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { createUser } from '@/services/appwriteapi';

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, form.username);
      
      // result może być null
      if (result) {
        setUser(result);
        setIsLogged(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Błąd', 'Rejestracja się powiodła, ale nie udało się zalogować.');
      }
      
    } catch (error: any) {
      Alert.alert('Błąd', error.message || "Błąd rejestracji");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
            <View className="w-full justify-center items-center">
                <Image
                source={icons.logo}
                className="w-[200px] h-[80px]"
                resizeMode="contain"
                />
            </View>
          <Text className="text-2xl text-white font-semibold mt-10">Zarejestruj się</Text>

           <View className="space-y-2 mt-10">
            <Text className="text-base text-gray-100">Nazwa użytkownika</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl items-center flex-row">
              <TextInput 
                className="flex-1 text-white text-base"
                value={form.username}
                placeholder="Twój nick"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, username: e })}
              />
            </View>
          </View>

          <View className="space-y-2 mt-7">
            <Text className="text-base text-gray-100">Email</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl items-center flex-row">
              <TextInput 
                className="flex-1 text-white text-base"
                value={form.email}
                placeholder="Podaj email"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, email: e })}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="space-y-2 mt-7">
            <Text className="text-base text-gray-100">Hasło</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl items-center flex-row">
              <TextInput 
                className="flex-1 text-white text-base"
                value={form.password}
                placeholder="Podaj hasło"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, password: e })}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={submit}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center mt-7 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            <Text className="text-primary font-bold text-lg">Zarejestruj się</Text>
          </TouchableOpacity>

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100">Masz już konto?</Text>
            <Link href="/sign-in" className="text-lg font-bold text-secondary">Zaloguj się</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;