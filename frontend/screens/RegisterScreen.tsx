import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

// Type for our navigation
type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = () => {
    // Basic validation
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    // Implement your registration logic here
    console.log("Register with:", username, email, password);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <ScrollView className="flex-1 bg-[#434371]">
      <StatusBar hidden />

      <View className="flex-1 p-4">
        {/* Golf silhouettes circle */}
        <View className="items-center my-6">
          <View className="w-32 h-32 rounded-full bg-[#1E1E3F] justify-center items-center">
            <Image
              source={require("../assets/golfers-silhouette.png")}
              className="w-24 h-12"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Register text */}
        <Text className="text-center text-white text-xl mb-6">
          Create your account
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

        {/* Email input */}
        <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
          <Image
            source={require("../assets/email-icon.png")}
            className="w-6 h-6 mx-2"
          />
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Email"
            placeholderTextColor="#A9A9C8"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password input */}
        <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
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

        {/* Confirm Password input */}
        <View className="bg-[#5D5C8D] rounded-md mb-6 flex-row items-center px-2">
          <Image
            source={require("../assets/lock-icon.png")}
            className="w-6 h-6 mx-2"
          />
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Confirm Password"
            placeholderTextColor="#A9A9C8"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Register button */}
        <TouchableOpacity
          className="bg-[#1E1E3F] py-3 rounded-md mb-6"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-bold">Register</Text>
        </TouchableOpacity>

        {/* Login link */}
        <View className="flex-row justify-center mb-4">
          <Text className="text-white mr-1">Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text className="text-[#A9A9C8] font-bold">Sign In Here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
