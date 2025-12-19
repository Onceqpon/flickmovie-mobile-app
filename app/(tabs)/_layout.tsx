import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { icons } from "@/constants/icons";
import { useGlobalContext } from "@/context/GlobalProvider";

const TAB_CONFIG: Record<string, { icon: ImageSourcePropType; title: string }> = {
  index: { icon: icons.home, title: "Home" },
  movies: { icon: icons.clapperboard, title: "Movies" },
  tvseries: { icon: icons.screen, title: "Series" },
  profile: { icon: icons.user, title: "Profile" },
};

// --- KOMPONENT POJEDYNCZEJ ZAKŁADKI ---
const TabItem = ({
  focused,
  icon,
  title,
  onPress,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.7}
      className="flex-1 justify-center items-center h-full gap-1"
    >
      <View className="justify-center items-center w-10 h-10 relative">
        {focused && (
          <LinearGradient
            colors={['#FF9C01', '#FF3C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute w-full h-full rounded-full"
          />
        )}

        <Image
          source={icon}
          tintColor={focused ? "#FFFFFF" : "#6B7280"}
          className="w-5 h-5"
          resizeMode="contain"
        />
      </View>

      <Text
        className={`text-[10px] font-bold ${
          focused ? 'text-secondary' : 'text-gray-500'
        }`}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// --- ŚRODKOWY PRZYCISK (PLAY) ---
const PlayButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }}
    activeOpacity={0.9}
    className="top-[-20px] mx-2 shadow-lg shadow-orange-500/40"
    style={{ zIndex: 10 }}
  >
    <LinearGradient
      colors={['#FF9C01', '#FF3C00']}
      className="w-16 h-16 rounded-full justify-center items-center border-[4px] border-[#000c1c]"
    >
      <Image 
        source={icons.play} 
        className="w-7 h-7 ml-1" 
        tintColor="#FFFFFF" 
        resizeMode="contain" 
      />
    </LinearGradient>
  </TouchableOpacity>
);

// --- PASEK NAWIGACJI ---
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const { isLogged } = useGlobalContext();

  return (
    <View className="absolute bottom-0 w-full items-center pb-6 pt-2">
      <View className="flex-row bg-[#000c1c] w-[92%] h-[68px] rounded-[34px] border border-[#232533] items-center px-1 justify-between shadow-xl shadow-black">
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name];

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

          // POPRAWKA TUTAJ: Klucz "key" jest teraz na React.Fragment i jest równy route.key
          if (index === 2) {
            return (
              <React.Fragment key={route.key}>
                {isLogged ? (
                  <PlayButton onPress={() => router.push("/game" as any)} />
                ) : (
                  <View className="w-8" />
                )}
                
                {/* Usunięto key={route.key} z TabItem, bo jest już na Fragmencie */}
                <TabItem
                  focused={isFocused}
                  icon={config?.icon || icons.home}
                  title={config?.title || ""}
                  onPress={onPress}
                />
              </React.Fragment>
            );
          }

          return (
            <TabItem
              key={route.key}
              focused={isFocused}
              icon={config?.icon || icons.home}
              title={config?.title || ""}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="movies" options={{ title: "Movies" }} />
      <Tabs.Screen name="tvseries" options={{ title: "Series" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}