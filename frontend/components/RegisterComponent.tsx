import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Golfsvg from "../assets/Golfsvg.svg";
import Emailsvg from "../assets/email.svg";
import Usernamesvg from "../assets/username.svg";
import Passwordsvg from "../assets/password.svg";
import Idsvg from "../assets/id-card.svg"

// Type for our navigation
type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

const RegisterScreen = ({
  firstname, setFirstname,
  lastname, setLastname,
  username, setUsername,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  errorMessage, isLoading,
  handleRegister, handleLogin
}) => {

  const scrollRef = useRef(null);

  const scrollToField = (yOffset: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: yOffset, animated: true });
    }, 100);
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
            {/* Golf SVG */}
            <View className="items-center">
              <Golfsvg width={350} height={350} />
            </View>

            {/* Register text */}
            <Text className="text-center text-white text-xl mb-6">
              Create your account
            </Text>

            {/* First name*/}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
              <Idsvg width={32} height={23} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="First name"
                placeholderTextColor="#A9A9C8"
                value={firstname}
                onChangeText={setFirstname}
                onFocus={() => scrollToField(200)}
              />
            </View>

            {/* Last name*/}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
            <Idsvg width={32} height={23} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="Last name"
                placeholderTextColor="#A9A9C8"
                value={lastname}
                onChangeText={setLastname}
                onFocus={() => scrollToField(200)}
              />
            </View>

            {/* Username input */}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
              <Usernamesvg width={34} height={21} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="Username"
                placeholderTextColor="#A9A9C8"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                onFocus={() => scrollToField(200)}
              />
            </View>

            {/* Email input */}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
              <Emailsvg width={35} height={25} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="Email"
                placeholderTextColor="#A9A9C8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => scrollToField(250)}
              />
            </View>

            {/* Password input */}
            <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
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

            {/* Confirm Password input */}
            <View className="bg-[#5D5C8D] rounded-md mb-6 flex-row items-center px-2">
              <Passwordsvg width={35} height={30} />
              <TextInput
                className="flex-1 py-3 text-white"
                placeholder="Confirm Password"
                placeholderTextColor="#A9A9C8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Error message */}
            {errorMessage ? (
              <View>
                <Text className="text-white mb-1 font-bold">{errorMessage}</Text>
              </View>
            ) : null}

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
