import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

// Type for our navigation
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = () => {
    // Implement your login logic here
    console.log("Login with:", username, password);
    // If successful, navigate to the main app
    // navigation.navigate('MainApp');
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleForgotPassword = () => {
    // Implement your forgot password logic
    console.log("Forgot password");
  };

  return (
    <View className="flex-1 bg-[#434371]">
      <StatusBar hidden />

      <View className="flex-1 p-4">
        {/* Golf silhouettes circle */}
        <View className="items-center my-8">
          <View className="w-32 h-32 rounded-full bg-[#1E1E3F] justify-center items-center">
            <Image
              source={require("../assets/golfers-silhouette.png")}
              className="w-24 h-12"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Login text */}
        <Text className="text-center text-white text-xl mb-6">
          Sign into your account
        </Text>

        {/* Username input */}
        <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
          <Image
            source={require("../assets/user-icon.png")}
            className="w-6 h-6 mx-2"
          />
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Username"
            placeholderTextColor="#A9A9C8"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Password input */}
        <View className="bg-[#5D5C8D] rounded-md mb-2 flex-row items-center px-2">
          <Image
            source={require("../assets/lock-icon.png")}
            className="w-6 h-6 mx-2"
          />
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Password"
            placeholderTextColor="#A9A9C8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          className="self-end mb-6"
          onPress={handleForgotPassword}
        >
          <Text className="text-white text-sm">Forgot password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          className="bg-[#1E1E3F] py-3 rounded-md mb-6"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold">Login</Text>
        </TouchableOpacity>

        {/* Register link */}
        <View className="flex-row justify-center">
          <Text className="text-white mr-1">Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text className="text-[#A9A9C8] font-bold">Register Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
