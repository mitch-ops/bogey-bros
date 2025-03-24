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
import { RootStackParamList } from "../../App";
import Golfsvg from "../assets/Golfsvg.svg"
import {API_URL} from "@env"

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const containsEmptyFields = () => {
    return !username || !email || !password || !confirmPassword;
  };

  const handleRegister = async () => {
    // Basic validation
    if(containsEmptyFields()) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    else {
      setErrorMessage('');
      const registerData = {
        username: username,
        email: email,
        password: password
      };

      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData)
        });
        const data = await response.json();
        console.log('Register Response:', data);
        if (data.message === 'User registered successfully') {
          console.log('User registered successfully!');
        } else {
          console.log('Registration error:', data.message);
          setErrorMessage('User with email or username exists.')
        }
      } catch (error) {
        console.error('Error registering user:', error);
      } finally {
        setIsLoading(false);
      }
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
        <View className="items-center">
          <Golfsvg width={425} height={425}/>
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

        {/* Passwords didn't match*/}
        {errorMessage ? 
        (<View>
          <Text className="text-white mb-1 font-bold">{errorMessage}</Text>
        </View>) 
        : null
        }
        {/* Register button */}
        <TouchableOpacity
          className="bg-[#1E1E3F] py-3 rounded-md mb-6"
          onPress={handleRegister}
          disabled={isLoading}
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
