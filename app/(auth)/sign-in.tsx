import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getCurrentUser, signIn } from '@/services/appwriteapi';

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      
      // result może być null, więc sprawdzamy
      if (result) {
        setUser(result);
        setIsLogged(true);
        Alert.alert("Sukces", "Zalogowano pomyślnie");
        router.replace('/(tabs)');
      } else {
         Alert.alert('Błąd', 'Nie udało się pobrać danych użytkownika');
      }

    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Wystąpił nieznany błąd');
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
          
          <Text className="text-2xl text-white font-semibold mt-10 font-psemibold">Zaloguj się do FlickMovie</Text>

          <View className="space-y-2 mt-7">
            <Text className="text-base text-gray-100 font-pmedium">Email</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput 
                className="flex-1 text-white font-psemibold text-base"
                value={form.email}
                placeholder="Podaj email"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, email: e })}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className="space-y-2 mt-7">
            <Text className="text-base text-gray-100 font-pmedium">Hasło</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput 
                className="flex-1 text-white font-psemibold text-base"
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
            activeOpacity={0.7}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center mt-7 ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
          >
            <Text className="text-primary font-bold text-lg">Zaloguj się</Text>
          </TouchableOpacity>

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">Nie masz konta?</Text>
            {/* POPRAWKA: usunięto konflikt klas text-blue-400 i text-secondary. Zostawiam text-secondary dla spójności */}
            <Link href="/sign-up" className="text-lg font-psemibold text-secondary">Zarejestruj się</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;