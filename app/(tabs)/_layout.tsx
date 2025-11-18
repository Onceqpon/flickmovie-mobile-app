import { Tabs } from "expo-router";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Text,
  View,
} from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

interface TabIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

function TabIcon({ focused, icon, title }: TabIconProps) {
  if (focused) {
    return (
      <ImageBackground
        source={images.btbackground}
        className="flex flex-row w-full flex-1 min-w-[112px] min-h-[60px] mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text
          className="text-base font-semibold ml-2 text-white">
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
}

const tabScreens = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "movies", title: "Movies", icon: icons.clapperboard },
  { name: "tvseries", title: "TV/Series", icon: icons.screen },
  { name: "profile", title: "Profile", icon: icons.user },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // ... Twoje obecne screenOptions
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
          tabBarStyle: {
          backgroundColor: "#000c1c",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23",
        },
      }}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={screen.icon} title={screen.title} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}