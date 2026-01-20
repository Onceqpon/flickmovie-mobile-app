import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { cssInterop } from "nativewind";
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/constants/icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { deleteFile, updateUserAvatar, updateUserName, uploadFile } from '@/services/appwriteapi';

cssInterop(LinearGradient, {
  className: "style",
});

const EditProfile = () => {
  const { user, setUser } = useGlobalContext();
  
  // --- LOGIKA AVATARA ---
  const rawAvatar = (user?.prefs as any)?.avatar;
  const initialAvatar = (rawAvatar && rawAvatar.length > 0)
    ? rawAvatar
    : `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(user?.name || 'User')}&project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;

  const [username, setUsername] = useState(user?.name || '');
  const [image, setImage] = useState<{ uri: string } | null>({ uri: initialAvatar });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!username) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = rawAvatar;

      // Jeśli wybrano nowy obrazek z galerii (nie jest to stary URL ani Initials API)
      if (image?.uri && image.uri !== rawAvatar && !image.uri.startsWith('http')) {
        const file = {
          uri: image.uri,
          name: `profile_${user.$id}.jpg`,
          type: 'image/jpeg',
        };
        
        const uploadedUrl = await uploadFile(file);

        if (!uploadedUrl) {
            throw new Error("Failed to upload image");
        }

        // Usuń stary plik z Storage, jeśli to był plik Appwrite (nie inicjały)
        if (avatarUrl && avatarUrl.includes('/files/')) {
            const fileIdMatch = avatarUrl.match(/files\/([^/]+)\//);
            if (fileIdMatch && fileIdMatch[1]) {
                await deleteFile(fileIdMatch[1]);
            }
        }

        avatarUrl = uploadedUrl; 
        await updateUserAvatar(avatarUrl);
      }

      const updatedUser = await updateUserName(username);
      
      setUser((prev: any) => ({
        ...prev,
        name: updatedUser.name,
        prefs: { ...prev.prefs, avatar: avatarUrl }
      }));

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="h-full">
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
          <Text className="text-2xl text-white font-bold">Edit Profile</Text>
        </View>

        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage}>
            <View className="w-24 h-24 rounded-full border-2 border-secondary justify-center items-center bg-black-100 mb-4 overflow-hidden">
                <Image 
                  source={{ uri: image?.uri }} 
                  className="w-full h-full" 
                  resizeMode="cover" 
                />
            </View>
          </TouchableOpacity>
          <Text className="text-secondary font-semibold" onPress={pickImage}>
            Change Profile Picture
          </Text>
        </View>

        <View className="space-y-2">
          <Text className="text-base text-gray-100 font-medium">Username</Text>
          <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
            <TextInput 
              className="flex-1 text-white font-semibold text-base"
              value={username}
              placeholder="Enter your username"
              placeholderTextColor="#7b7b8b"
              onChangeText={setUsername}
            />
          </View>
        </View>

        <View className="mt-8">
            <TouchableOpacity 
            onPress={() => router.push('/profile/change-password')}
            className="border-2 border-secondary rounded-xl min-h-[62px] justify-center items-center"
            >
            <Text className="text-secondary font-bold text-lg">Change Password</Text>
            </TouchableOpacity>
        </View>

        <View className="mt-4">
            <TouchableOpacity 
            onPress={submit}
            className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${isSubmitting ? 'opacity-50' : ''}`}
            disabled={isSubmitting}
            >
            <Text className="text-primary font-bold text-lg">Save Changes</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;