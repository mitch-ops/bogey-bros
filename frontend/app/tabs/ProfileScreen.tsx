import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { API_URL, useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native"; // <-- ADD THIS
import golfBackground from "../../assets/GolfballBackground.png";
import defaultAvatar from "../../assets/defaultpfp.jpg";

const ProfileScreen = ({ navigation }) => {
  const { authState, refreshAuthToken } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserData = async () => {
    if (!authState?.authenticated) return;
    try {
      setLoading(true);
      refreshAuthToken!();
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${authState?.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Failed fetching user data:", error);
      Alert.alert("Error", "Could not fetch profile info.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data ONCE when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#434371" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Avatar */}
      <Image
        style={styles.avatar}
        source={
          userData?.profilePicture
            ? { uri: `data:image/jpeg;base64,${userData.profilePicture}` }
            : defaultAvatar
        }
      />

      {/* Name */}
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{userData?.firstName || "First"}</Text>
        <Text style={styles.nameText}>{userData?.lastName || "Last"}</Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={styles.editProfile}
        onPress={() => navigation.navigate("EditView")}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Bio */}
      <View style={styles.bioView}>
        <Text style={styles.header}>Bio:</Text>
        <View style={styles.bioBodyContainer}>
          <Text style={styles.bioBodyText}>
            {userData?.bio || "Write something about yourself!"}
          </Text>
        </View>
      </View>

      {/* Handicap */}
      <View style={styles.handicapContainer}>
        <Text style={styles.header}>Handicap</Text>
        <ImageBackground style={styles.handicapImage} source={golfBackground}>
          <Text style={styles.handicapText}>
            {userData?.handicap != null ? userData.handicap : "N/A"}
          </Text>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: "#434371", marginBottom: 10 },
  nameView: { flexDirection: "row" },
  nameText: { padding: 10, fontSize: 20 },
  editProfile: { backgroundColor: "#434371", paddingHorizontal: 30, paddingVertical: 5, borderRadius: 5 },
  editText: { fontSize: 20, color: "white" },
  bioView: { alignItems: "flex-start", paddingTop: 20, width: "90%" },
  header: { padding: 5, fontSize: 20 },
  bioBodyContainer: { backgroundColor: "#D9D9D9", padding: 10, borderRadius: 10, width: "100%" },
  bioBodyText: { fontSize: 16, lineHeight: 16 * 1.3 },
  handicapContainer: { alignItems: "center", paddingTop: 25 },
  handicapImage: { width: 200, height: 200, justifyContent: "center", alignItems: "center" },
  handicapText: { color: "white", fontSize: 40 },
});

export default ProfileScreen;
