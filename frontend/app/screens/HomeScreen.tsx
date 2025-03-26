import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App"; // Import the type
import background from "../assets/background.jpg";
import TitleCard from "../../components/TitleCard";
import React from "react";

// Type for our navigation
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleContinue = () => {
    navigation.navigate("Login");
  };

  return (
    <TouchableOpacity
      className="flex-1"
      activeOpacity={0.9}
      onPress={handleContinue}
    >
      <StatusBar hidden />
      <ImageBackground className="flex-1 justify-center" source={background}>
        <TitleCard title="BOGEY" location="top" />
        <TitleCard title="BROS" location="bottom" />
        <View className="shadow-lg">
          <Text className="text-center text-3xl font-bold text-white">
            Welcome!
          </Text>
          <Text className="text-center text-3xl font-bold text-white">
            Tap to continue
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
