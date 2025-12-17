import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import React from "react";

// Konfiguracja wyglądu dla prawdziwych zakładek
const TAB_CONFIG: Record<string, { icon: ImageSourcePropType; title: string }> = {
  index: { icon: icons.home, title: "Home" },
  movies: { icon: icons.clapperboard, title: "Movies" },
  tvseries: { icon: icons.screen, title: "TV/Series" },
  profile: { icon: icons.user, title: "Profile" },
};

// Komponent pojedynczego przycisku zakładki (Home, Movies, itp.)
function TabItem({ 
  focused, 
  icon, 
  title, 
  onPress 
}: { 
  focused: boolean; 
  icon: ImageSourcePropType; 
  title: string; 
  onPress: () => void;
}) {
  if (focused) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="flex-1">
        <ImageBackground
          source={images.btbackground || images.mainbg} 
          imageStyle={{ borderRadius: 50 }}
          className="flex-row w-full h-full min-w-[80px] justify-center items-center rounded-full overflow-hidden"
        >
          <Image source={icon} tintColor="#151312" className="size-5" />
          <Text className="text-xs font-bold ml-1 text-[#151312]" numberOfLines={1}>
            {title}
          </Text>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      className="flex-1 justify-center items-center h-full"
    >
      <Image source={icon} tintColor="#A8B5DB" className="size-6" />
    </TouchableOpacity>
  );
}

// --- NASZ WŁASNY PASEK NAWIGACJI ---
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-9 left-5 right-5 h-[64px] bg-[#000c1c] rounded-[50px] border border-[#0F0D23] flex-row items-center p-1 shadow-lg shadow-black/50 justify-between">
      
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];

        // Obsługa kliknięcia w zakładkę
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const tabButton = (
          <TabItem
            key={route.key}
            focused={isFocused}
            icon={config?.icon || icons.home}
            title={config?.title || ""}
            onPress={onPress}
          />
        );

        // --- MAGIA: WSTAWIAMY PRZYCISK PLAY NA ŚRODEK ---
        // Mamy 4 zakładki (indeksy 0, 1, 2, 3).
        // Chcemy Play pomiędzy indeksem 1 (Movies) a 2 (TVSeries).
        // Więc przed wyrenderowaniem indeksu 2, wstawiamy Play.
        if (index === 2) {
          return (
            <React.Fragment key="play-wrapper">
              {/* Środkowy Przycisk Play */}
              <TouchableOpacity
                onPress={() => router.push("/game/setup" as any)}
                activeOpacity={0.8}
                className="w-14 h-14 bg-secondary rounded-full justify-center items-center shadow-lg shadow-orange-500/40 border-4 border-[#000c1c] -mt-6 mx-1"
              >
                 <Image source={icons.play} className="size-6 ml-1" tintColor="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Następnie renderujemy normalną zakładkę (TVSeries) */}
              {tabButton}
            </React.Fragment>
          );
        }

        return tabButton;
      })}
    </View>
  );
} // Potrzebne do React.Fragment

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Definiujemy KOLEJNOŚĆ zakładek. To bardzo ważne! */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="movies" options={{ title: "Movies" }} />
      {/* Tutaj w CustomTabBar wskoczy przycisk Play */}
      <Tabs.Screen name="tvseries" options={{ title: "TV/Series" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}