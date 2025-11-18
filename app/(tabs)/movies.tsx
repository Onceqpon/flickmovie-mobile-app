import { images } from '@/constants/images'
import React from 'react'
import { ImageBackground, StyleSheet, Text, View } from 'react-native'

const movies = () => {
  return (
    <View className="flex-1 items-center justify-center">
          <ImageBackground 
            source={images.mainbg}
            className="flex-1 w-full items-center justify-center"
            >
            <Text className="font-bold text-3xl text-white">search</Text>
          </ImageBackground>
        </View>
  )
}

export default movies

const styles = StyleSheet.create({})