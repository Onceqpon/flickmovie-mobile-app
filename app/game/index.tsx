import { icons } from "@/constants/icons"; // Upewnij się, że masz tu swoje ikony
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameWelcomeScreen() {
  const router = useRouter();

  const handleSoloPress = () => {
    // Przechodzimy do ekranu konfiguracji (tego, który naprawialiśmy wcześniej)
    router.push("/game/setup");
  };

  const handleGroupPress = () => {
    // Opcjonalnie: Alert dla ciekawskich, mimo że przycisk wygląda na nieaktywny
    Alert.alert("Już wkrótce!", "Pracujemy nad trybem dla par i grup. Wyczekuj aktualizacji!");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary px-6 justify-center">
      <StatusBar style="light" />

      {/* --- NAGŁÓWEK --- */}
      <View className="items-center mb-10">
        <View className="relative">
             <Text className="text-4xl text-white font-black text-center tracking-wider">
                FLICK<Text className="text-secondary">MOVIE</Text>
             </Text>
             {/* Ozdobny element pod tekstem */}
             <Image
                source={icons.path} // Jeśli masz taki asset (kreska), jeśli nie - usuń linię
                className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
                resizeMode="contain"
             />
        </View>
        <Text className="text-gray-400 text-center mt-4 font-medium">
            Wybierz tryb i znajdź idealny film na dziś.
        </Text>
      </View>

      {/* --- KARTY WYBORU --- */}
      <View className="gap-6">
        
        {/* KARTA: SOLO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSoloPress}
          className="w-full bg-black-100 border-2 border-secondary/50 rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-black/40"
        >
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
                <Text className="text-2xl text-white font-bold mr-2">Solo</Text>
                <View className="bg-secondary/20 px-2 py-1 rounded-md">
                    <Text className="text-secondary text-xs font-bold uppercase">Teraz</Text>
                </View>
            </View>
            <Text className="text-gray-400 text-sm leading-5">
              Stwórz własną watchlistę. Przesuwaj karty i odkrywaj nowości dopasowane do Ciebie.
            </Text>
          </View>
          
          <View className="w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-md shadow-secondary/50">
             <Image 
                source={icons.user} // Ikona ludzika/profilu
                className="w-6 h-6" 
                tintColor="white" 
             />
          </View>
        </TouchableOpacity>

        {/* KARTA: GRUPA (COMING SOON) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleGroupPress}
          // Stylizacja "disabled": mniejsza jasność (opacity), szare obramowanie
          className="w-full bg-black-100 border-2 border-gray-800 rounded-3xl p-6 flex-row items-center justify-between opacity-60"
        >
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
                <Text className="text-2xl text-gray-300 font-bold mr-2">W Parze</Text>
                {/* Badge Coming Soon */}
                <View className="bg-gray-700 px-2 py-1 rounded-md border border-gray-600">
                    <Text className="text-gray-300 text-xs font-bold uppercase">Wkrótce</Text>
                </View>
            </View>
            <Text className="text-gray-500 text-sm leading-5">
              Połącz telefony i matchujcie filmy razem. Koniec kłótni o pilota!
            </Text>
          </View>
          
          <View className="w-14 h-14 bg-gray-800 rounded-full items-center justify-center border border-gray-700">
             {/* Tutaj przydałaby się ikona np. 2 osób */}
             <Image 
                source={icons.people} // Upewnij się że masz ikonę 'people' lub 'bookmark'
                className="w-6 h-6 opacity-50" 
                tintColor="white" 
             />
          </View>
        </TouchableOpacity>

      </View>

      {/* --- STOPKA / INFO --- */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <Text className="text-gray-600 text-xs font-pregular">
            Powered by TMDb & JustWatch
        </Text>
      </View>

    </SafeAreaView>
  );
}