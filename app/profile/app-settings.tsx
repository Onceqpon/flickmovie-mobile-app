import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
// Dodaj import nowej funkcji API (upewnij się, że ją stworzyłeś w kroku 2)
import { createReport, signOut } from '@/services/appwriteapi';
// Dodaj import Modala (upewnij się, że plik istnieje)
import ReportModal from '@/components/ReportModal';

const SettingRow = ({ label, value, onValueChange }: { label: string, value: boolean, onValueChange: (val: boolean) => void }) => (
  <View className="flex-row items-center justify-between py-4 border-b border-white/5">
    <Text className="text-white text-lg font-medium">{label}</Text>
    <Switch
      trackColor={{ false: "#333", true: "#FFA001" }}
      thumbColor={value ? "#fff" : "#f4f3f4"}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

export default function AppSettings() {
  const router = useRouter();
  const { setUser, setIsLogged, user } = useGlobalContext(); // Pobieramy 'user' aby mieć ID
  
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [updates, setUpdates] = useState(true);
  
  // Stan dla modala zgłaszania problemu
  const [reportModalVisible, setReportModalVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedNotifs = await AsyncStorage.getItem('setting_notifications');
        const savedSound = await AsyncStorage.getItem('setting_sound');
        const savedUpdates = await AsyncStorage.getItem('setting_updates');

        if (savedNotifs !== null) setNotifications(JSON.parse(savedNotifs));
        if (savedSound !== null) setSound(JSON.parse(savedSound));
        if (savedUpdates !== null) setUpdates(JSON.parse(savedUpdates));
      } catch (e) {
        console.error("Failed to load settings");
      }
    };
    loadSettings();
  }, []);

  const toggleSetting = async (key: string, value: boolean, setter: (v: boolean) => void) => {
      setter(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const handleClearCache = () => {
      Alert.alert(
          "Clear Cache?",
          "This will reset your local settings and log you out. Are you sure?",
          [
              { text: "Cancel", style: "cancel" },
              { 
                  text: "Clear", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await signOut();
                          await AsyncStorage.clear(); 
                          setUser(null);
                          setIsLogged(false);
                          Alert.alert("Success", "Cache cleared.");
                          router.replace('/(tabs)'); 
                      } catch (e) {
                          console.error(e);
                          await AsyncStorage.clear();
                          setUser(null);
                          setIsLogged(false);
                          router.replace('/(tabs)');
                      }
                  }
              }
          ]
      );
  };

  // Obsługa wysłania zgłoszenia
  const handleReportSubmit = async (description: string) => {
    if (!user) return;
    // Wywołanie funkcji API
    await createReport(user.$id, description);
  };

  return (
    <View className="flex-1 bg-[#1E1E2D]">
      <LinearGradient colors={["#000C1C", "#161622", "#1E1E2D"]} className="absolute w-full h-full" />
      <SafeAreaView className="flex-1 px-4">
        
        <View className="flex-row items-center mt-4 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/10 rounded-full mr-4">
             <Image source={icons.left_arrow} className="w-5 h-5" tintColor="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">App Settings</Text>
        </View>

        <ScrollView>
            <Text className="text-secondary font-bold uppercase tracking-widest mb-2 opacity-80">General</Text>
            <View className="bg-white/5 rounded-2xl px-4 mb-6">
                <SettingRow 
                    label="Push Notifications" 
                    value={notifications} 
                    onValueChange={(val) => toggleSetting('setting_notifications', val, setNotifications)} 
                />
                <SettingRow 
                    label="Sound Effects" 
                    value={sound} 
                    onValueChange={(val) => toggleSetting('setting_sound', val, setSound)} 
                />
                <SettingRow 
                    label="Auto-Updates" 
                    value={updates} 
                    onValueChange={(val) => toggleSetting('setting_updates', val, setUpdates)} 
                />
            </View>

            {/* NOWA SEKCJA SUPPORT */}
            <Text className="text-secondary font-bold uppercase tracking-widest mb-2 opacity-80">Support</Text>
            <View className="bg-white/5 rounded-2xl px-4 mb-6">
                <TouchableOpacity onPress={() => setReportModalVisible(true)} className="py-4 border-b border-white/5 flex-row justify-between items-center">
                    <Text className="text-white text-lg">Report a Problem</Text>
                    {/* Opcjonalnie: ikona ostrzeżenia lub strzałka */}
                    <Image source={icons.copy} className="w-4 h-4 opacity-50" resizeMode="contain" tintColor="white" /> 
                </TouchableOpacity>
            </View>

            <Text className="text-secondary font-bold uppercase tracking-widest mb-2 opacity-80">Data</Text>
            <View className="bg-white/5 rounded-2xl px-4 mb-10">
                <TouchableOpacity onPress={handleClearCache} className="py-4 border-b border-white/5">
                    <Text className="text-white text-lg">Clear Cache</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Contact Support", "Please contact support@flickmovie.com to delete your account.")} className="py-4">
                    <Text className="text-red-500 text-lg font-bold">Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>

        {/* Modal jest tutaj, poza ScrollView */}
        <ReportModal 
            visible={reportModalVisible} 
            onClose={() => setReportModalVisible(false)} 
            onSubmit={handleReportSubmit}
        />

      </SafeAreaView>
    </View>
  );
}