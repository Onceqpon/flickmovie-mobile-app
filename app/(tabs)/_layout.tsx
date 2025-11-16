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
        className="flex flex-row w-full flex-1 min-w-[112px] min-h-[200px] mt-5 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text
          className="text-secondary text-base font-semibold ml-2 text-white"
        >
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 mt-5 justify-center items-center rounded-full overflow-hidden">
      <Image source={icon} tintColor="#A8B5DB" className="size-7" />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 15,
          marginBottom: 40,
          height: 60,
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Index",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Search" />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.user} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}