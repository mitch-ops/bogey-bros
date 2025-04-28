import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../context/AuthContext";
import defaultAvatar from "../../assets/defaultpfp.jpg"; // fallback if no avatar
import golfBackground from "../../assets/GolfballBackground.png";

const ProfileScreen = ({ navigation }) => {
  const { authState, refreshAuthToken } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      await refreshAuthToken?.();
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${authState?.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setProfileData(data);

      if (data.profilePicture) {
        setAvatarUri(`data:image/jpeg;base64,${data.profilePicture}`);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);

      Alert.alert(
        "Failed to load profile",
        "Something went wrong while fetching your profile. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => fetchProfile(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "white" }}>No profile data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar */}
      <Image
        style={styles.avatar}
        source={avatarUri ? { uri: avatarUri } : defaultAvatar}
      />

      {/* Name */}
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{profileData.firstName}</Text>
        <Text style={styles.nameText}>{profileData.lastName}</Text>
      </View>

      {/* Edit Button */}
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
            {profileData.bio || "No bio provided."}
          </Text>
        </View>
      </View>

      {/* Handicap */}
      <View style={styles.handicapContainer}>
        <Text style={styles.header}>Handicap</Text>
        <ImageBackground style={styles.handicapImage} source={golfBackground}>
          <Text style={styles.handicapText}>
            {profileData.handicap ?? "N/A"}
          </Text>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff", 
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#434371",
    marginBottom: 10,
  },
  nameView: {
    flexDirection: "row",
    marginBottom: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  editProfile: {
    backgroundColor: "#434371",
    paddingHorizontal: 30,
    paddingVertical: 5,
    borderRadius: 5,
    marginVertical: 10,
  },
  editText: {
    color: "white",
    fontSize: 18,
  },
  bioView: {
    alignItems: "flex-start",
    paddingTop: 20,
    width: "90%",
  },
  header: {
    fontSize: 20,
    marginBottom: 5,
  },
  bioBodyContainer: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  bioBodyText: {
    fontSize: 16,
    lineHeight: 20,
  },
  handicapContainer: {
    alignItems: "center",
    paddingTop: 25,
  },
  handicapImage: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  handicapText: {
    color: "white",
    fontSize: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#434371",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#434371",
  },
});

export default ProfileScreen;
