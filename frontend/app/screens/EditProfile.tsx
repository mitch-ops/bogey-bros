import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { API_URL } from "../context/AuthContext";

const EditProfile = () => {
  const navigation = useNavigation();
  const { authState } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${authState?.token}`,
          },
        });

        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password: password || undefined, // optional
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      Alert.alert("Success", "Profile updated!");
      navigation.goBack(); // Or navigate elsewhere
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#434371] p-4 pt-12">
      <StatusBar hidden />
      <Text className="text-white text-xl text-center mb-8">
        Edit Your Profile
      </Text>

      {/* Username */}
      <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
        <Image
          source={require("../../assets/user-icon.png")}
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

      {/* Email */}
      <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
        <Image
          source={require("../../assets/email-icon.png")} // Use an email icon if available
          className="w-6 h-6 mx-2"
        />
        <TextInput
          className="flex-1 py-3 text-white"
          placeholder="Email"
          placeholderTextColor="#A9A9C8"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View className="bg-[#5D5C8D] rounded-md mb-4 flex-row items-center px-2">
        <Image
          source={require("../../assets/lock-icon.png")}
          className="w-6 h-6 mx-2"
        />
        <TextInput
          className="flex-1 py-3 text-white"
          placeholder="New Password"
          placeholderTextColor="#A9A9C8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        className="bg-[#1E1E3F] py-3 rounded-md mt-6"
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfile;
