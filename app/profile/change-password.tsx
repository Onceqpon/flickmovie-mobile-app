import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 1. Dodano importy dla Gradientu i NativeWind
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from "nativewind";

import { icons } from '@/constants/icons';
import { updateUserPassword } from '@/services/appwriteapi';

// 2. Konfiguracja cssInterop dla LinearGradient
cssInterop(LinearGradient, {
  className: "style",
});

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (form.newPassword.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters long");
        return;
    }

    setIsSubmitting(true);

    try {
      await updateUserPassword(form.newPassword, form.oldPassword);
      Alert.alert("Success", "Password updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 3. Usunięto 'bg-primary' z SafeAreaView
    <SafeAreaView className="h-full">
      
      {/* 4. Dodano LinearGradient jako tło */}
      <LinearGradient
          colors={["#000C1C", "#161622", "#1E1E2D"]}
          className="absolute w-full h-full"
        />

      <ScrollView className="px-4 my-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Image 
              source={icons.left_arrow} 
              className="w-6 h-6" 
              resizeMode="contain" 
              style={{ tintColor: '#fff' }}
            />
          </TouchableOpacity>
          <Text className="text-2xl text-white font-bold">Change Password</Text>
        </View>

        <View className="space-y-4 mt-4">
          
          <View className="space-y-2">
            <Text className="text-base text-gray-100 font-medium">Current Password</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput 
                className="flex-1 text-white font-semibold text-base"
                value={form.oldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, oldPassword: e })}
                secureTextEntry
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-gray-100 font-medium">New Password</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput 
                className="flex-1 text-white font-semibold text-base"
                value={form.newPassword}
                placeholder="Enter new password"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, newPassword: e })}
                secureTextEntry
              />
            </View>
          </View>

          <View className="space-y-2">
            <Text className="text-base text-gray-100 font-medium">Confirm New Password</Text>
            <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput 
                className="flex-1 text-white font-semibold text-base"
                value={form.confirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#7b7b8b"
                onChangeText={(e) => setForm({ ...form, confirmPassword: e })}
                secureTextEntry
              />
            </View>
          </View>

        </View>

        <View className="mt-8">
            <TouchableOpacity 
            onPress={submit}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            >
            <Text className="text-primary font-bold text-lg">Update Password</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;