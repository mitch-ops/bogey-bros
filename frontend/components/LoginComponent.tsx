import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useHeaderHeight } from '@react-navigation/elements';
import Golfsvg from "../assets/Golfsvg.svg";
import Emailsvg from "../assets/email.svg";
import Passwordsvg from "../assets/password.svg";

const LoginScreen = ({
  handleLogin, handleRegister,
  email, setEmail,
  password, setPassword,
  isLoading
}) => {
  const scrollRef = useRef(null);

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#434371]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-4">
            {/* Golf SVG stays up top */}
            <View className="items-center">
              <Golfsvg width={425} height={425} />
            </View>

            {/* Login Header */}
            <Text className="text-center text-white text-xl mb-6">
              Sign into your account
            </Text>

            {/* Email input */}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
              <Emailsvg width={35} height={25} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="Email"
                placeholderTextColor="#A9A9C8"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollTo({ y: 150, animated: true });
                  }, 100); // slight delay ensures keyboard is visible first
                }}
              />
            </View>

            {/* Password input */}
            <View className="bg-[#5D5C8D] rounded-md mb-2 flex-row items-center px-2">
              <Passwordsvg width={35} height={30} />
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
            <TouchableOpacity className="self-end mb-6" onPress={handleForgotPassword}>
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
