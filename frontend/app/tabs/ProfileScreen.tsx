import React, { useEffect, useState } from "react";
import { View, Text, Image, StatusBar, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext"; // Adjust if your path is different
import { API_URL } from "../context/AuthContext";

const ProfileScreen = () => {
  const { authState } = useAuth();

  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!authState?.token) throw new Error("No token found");

        console.log("📦 Fetching user with token:", authState.token);

        const response = await fetch(`${API_URL}/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authState.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("❌ API error:", response.status, errorBody);
          throw new Error(`Failed to fetch user. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ User data:", data);
        setUser(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (authState?.authenticated) {
      fetchUser();
    }
  }, [authState]);

  return (
    <View className="flex-1 items-center pt-16">
      <StatusBar hidden />
      <View className="mt-10 bg-red-500 w-full h-10" />
      <View className="border border-black">
      <Image
        source={require("../../assets/Avatar.png")}
        className="w-100 h-100 rounded-full mt-10"
      />
      </View>

      {loading ? (
        <Text className="text-black text-lg">Loading...</Text>
      ) : error ? (
        <Text className="text-red-400 text-lg mt-10">Error: {error}</Text>
      ) : user ? (
        <Text className="text-black text-lg font-bold mt-10">{user.username}</Text>
      ) : (
        <Text className="text-black text-lg mt-10">No user data available.</Text>
      )}

      <TouchableOpacity
                className="bg-[#1E1E3F] py-3 rounded-md mb-6"
                //onPress={handleEditProfile}
              >
                <Text className="text-white text-center font-bold">Edit Profile</Text>
              </TouchableOpacity>
    </View>

  );
};
export default ProfileScreen;
