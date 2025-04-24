import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../context/AuthContext";
import golfBackground from "../../assets/GolfballBackground.png";
import { useFocusEffect } from "@react-navigation/native";
import defaultAvatar from "../../assets/defaultpfp.jpg";

const ProfileScreen = ({ navigation }) => {
  const { authState, refreshAuthToken } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("Loading...");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("Loading bio...");
  const [handicap, setHandicap] = useState("...");

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        refreshAuthToken!();
        try {
          const { data } = await axios.get(`${API_URL}/user`);
          setFirstName(
            data.firstName?.trim() ? data.firstName : "firstname"
          );
          setLastName(
            data.lastName?.trim() ? data.lastName : "lastname"
          );
          setBio(data.bio || "No bio added yet.");
          setHandicap(data.handicap?.toString() || "N/A");
          if (data.profilePicture) {
            setAvatarUri(`data:image/jpeg;base64,${data.profilePicture}`);
          }
        } catch (err) {
          console.error("Failed to load user data", err);
        }
      };
      if (authState?.authenticated) fetchUserData();
    }, [authState])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.avatar}
        source={avatarUri ? { uri: avatarUri } : defaultAvatar}
      />
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{firstName}</Text>
        <Text style={styles.nameText}>{lastName}</Text>
      </View>
      <TouchableOpacity
        style={styles.editProfile}
        onPress={() => navigation.navigate("EditView")}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={styles.bioView}>
        <Text style={styles.header}>Bio:</Text>
        <View style={styles.bioBodyContainer}>
          <Text style={styles.bioBodyText}>{bio}</Text>
        </View>
      </View>

      <View style={styles.handicapContainer}>
        <Text style={styles.header}>Handicap</Text>
        <ImageBackground
          style={styles.handicapImage}
          source={golfBackground}
        >
          <Text style={styles.handicapText}>{handicap}</Text>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#434371",
    marginBottom: 10,
  },
  nameView: { flexDirection: "row" },
  nameText: { padding: 10, fontSize: 20 },
  editProfile: {
    backgroundColor: "#434371",
    paddingHorizontal: 30,
    padding: 2,
    borderRadius: 5,
  },
  editText: { fontSize: 20, color: "white" },
  bioView: { alignItems: "flex-start", paddingTop: 20, width: "90%" },
  header: { padding: 5, fontSize: 20 },
  bioBodyContainer: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  bioBodyText: { fontSize: 16, lineHeight: 16 * 1.3 },
  handicapContainer: { alignItems: "center", paddingTop: 25 },
  handicapImage: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  handicapText: { color: "white", fontSize: 40 },
});

export default ProfileScreen;
