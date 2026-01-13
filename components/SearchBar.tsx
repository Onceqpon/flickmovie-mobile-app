import { useState } from "react";
import { Image, TextInput, TouchableOpacity } from "react-native";

import { icons } from "@/constants/icons";

interface Props {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  autoFocus?: boolean;
}

const SearchBar = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onPress, 
  autoFocus = false 
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const isButtonMode = !!onPress && !onChangeText;

  return (
    <TouchableOpacity
      activeOpacity={isButtonMode ? 0.7 : 1}
      onPress={onPress}
      className={`flex-row items-center w-full h-16 px-4 bg-white/10 rounded-2xl border-2 space-x-4 ${
        isFocused ? "border-yellow-500" : "border-secondary"
      }`}
    >
      <Image
        source={icons.search}
        className="w-5 h-5"
        resizeMode="contain"
        tintColor="#CDCDE0"
      />

      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#CDCDE0"
        autoFocus={autoFocus}
        editable={!isButtonMode}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        pointerEvents={isButtonMode ? "none" : "auto"}
        className="text-base mt-0.5 text-white flex-1 font-pregular"
      />

      {!isButtonMode && value && value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText && onChangeText("")}>
            <Image 
                source={icons.close} 
                className="w-5 h-5"
                resizeMode="contain"
                tintColor="#CDCDE0"
            />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default SearchBar;