import { WatchProvidersData } from "@/interfaces/interfaces";
import React from "react";
import { Alert, Image, Linking, Text, TouchableOpacity, View } from "react-native";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const PROVIDER_URLS: Record<string, string> = {
  "Netflix": "https://www.netflix.com",
  "Disney Plus": "https://www.disneyplus.com",
  "Amazon Prime Video": "https://www.primevideo.com",
  "HBO Max": "https://www.hbomax.com",
  "Max": "https://www.max.com",
  "SkyShowtime": "https://www.skyshowtime.com",
  "Apple TV Plus": "https://tv.apple.com",
  "Viaplay": "https://viaplay.com",
  "Player": "https://player.pl",
  "Canal+ Online": "https://www.canalplus.com",
  "Rakuten TV": "https://www.rakuten.tv"
};

interface WatchProvidersProps {
  providers?: WatchProvidersData | null;
}

const WatchProviders = ({ providers }: WatchProvidersProps) => {
  if (!providers || !providers.flatrate) return null;

  const handlePress = (providerName: string, fallbackLink?: string) => {
    const mainPageUrl = PROVIDER_URLS[providerName];
    const targetUrl = mainPageUrl || fallbackLink;

    if (targetUrl) {
      Alert.alert(
        `Open ${providerName}`,
        "You will be redirected to the streaming service website.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Site", onPress: () => Linking.openURL(targetUrl) },
        ]
      );
    }
  };

  return (
    <View className="mb-6 px-5">
      <Text className="text-white font-bold text-lg mb-3">
        Where to Watch
      </Text>
      
      <View className="flex-row flex-wrap gap-4">
        {providers.flatrate.map((provider) => (
          <TouchableOpacity
            key={provider.provider_id}
            onPress={() => handlePress(provider.provider_name, providers.link)}
            activeOpacity={0.7}
            className="items-center"
          >
            <View className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/50">
              <Image
                source={{ uri: `${TMDB_IMAGE_BASE_URL}${provider.logo_path}` }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text 
              className="text-gray-400 text-[10px] mt-1 text-center w-16" 
              numberOfLines={1}
            >
              {provider.provider_name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text className="text-gray-500 text-xs mt-2 italic">
        Tap an icon to go to the streaming site.
      </Text>
    </View>
  );
};

export default WatchProviders;