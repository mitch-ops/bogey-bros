import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";

import Golfsvg from "../assets/Golfsvg.svg"
import Emailsvg from "../assets/email.svg";
import Passwordsvg from "../assets/password.svg";

const LoginScreen = ( {
    handleLogin, handleRegister, 
    email, setEmail, 
    password, setPassword,
    isLoading } ) => {

  const handleForgotPassword = () => {
    // Implement your forgot password logic
    console.log("Forgot password");
  };

  return (
    <View className="flex-1 bg-[#434371]">
      <StatusBar hidden />

      <View className="flex-1 p-4">
        {/* Golf silhouettes circle */}
        <View className="items-center">
          <Golfsvg width={425} height={425}/>
        </View>
        {/* Login text */}
        <Text className="text-center text-white text-xl mb-6">
          Sign into your account
        </Text>

        {/* Email input */}
        <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
        <Emailsvg width={35} height={25}/>
          <TextInput
            className="flex-1 py-3 text-white"
            placeholder="Email"
            placeholderTextColor="#A9A9C8"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password input */}
        <View className="bg-[#5D5C8D] rounded-md mb-2 flex-row items-center px-2">
        <Passwordsvg width={35} height={30}/>
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
          disabled={isLoading}
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