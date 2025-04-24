import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../../assets/defaultpfp.jpg";

const EditProfileScreen = ({ navigation }) => {
  const { authState, refreshAuthToken } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [handicap, setHandicap] = useState("");

  // Fetch profile and avatar on mount
  useEffect(() => {
    if (!authState?.authenticated) return;
    (async () => {
      refreshAuthToken!();
      try {
        const { data } = await axios.get(`${API_URL}/user`);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setHandicap(data.handicap?.toString() || "N/A");
        if (data.profilePicture) {
          // If backend returns base64:
          setAvatarUri(`data:image/jpeg;base64,${data.profilePicture}`);
          // Or if backend returns a URL:
          // setAvatarUri(data.profilePicture);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();
  }, [authState]);

  // Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need access to your photos to update your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await uploadAvatar(uri);
    }
  };

  // Upload the picked image
  const uploadAvatar = async (uri: string) => {
    try {
      const filename = uri.split("/").pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image";

      const formData = new FormData();
      formData.append("profilePicture", {
        uri,
        name: filename,
        type: mimeType,
      } as any);
      refreshAuthToken!();
      await axios.put(`${API_URL}/user/profilePicture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Could not upload profile picture.");
    }
  };

  // Save text fields
  const handleSave = async () => {

    try {
      refreshAuthToken!();
      const updateFields = { firstName, lastName, username, bio };
      await axios.put(`${API_URL}/user`, updateFields);
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Error saving profile:", err);
      Alert.alert("Error", "Something went wrong while saving your profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={avatarUri ? { uri: avatarUri } : defaultAvatar}
          style={styles.avatar}
        />
        <Text style={styles.changeText}>Change Picture</Text>
      </TouchableOpacity>

      {/* First Name */}
      <View style={styles.field}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
      </View>

      {/* Last Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
      </View>

      {/* Username */}
      <View style={styles.field}>
        <Text style={styles.label}>Username:</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
      </View>

      {/* Bio (280 char max) */}
      <View style={styles.field}>
        <Text style={styles.label}>Bio:</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          multiline
          maxLength={280}
          value={bio}
          onChangeText={setBio}
        />
        <Text style={styles.charCounter}>{bio.length}/280</Text>
      </View>

      {/* Handicap (read‑only) */}
      <View style={styles.field}>
        <Text style={styles.label}>Handicap:</Text>
        <Text style={styles.staticHandicap}>{handicap}</Text>
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center", paddingBottom: 40 },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: "#434371", marginBottom: 10 },
  changeText: { textAlign: "center", color: "#434371", fontWeight: "bold", marginBottom: 30 },
  field: { width: "100%", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, color: "#333" },
  input: { backgroundColor: "#f1f1f1", borderRadius: 8, padding: 10, fontSize: 16 },
  bioInput: { height: 100, textAlignVertical: "top" },
  charCounter: { alignSelf: "flex-end", marginRight: 10, fontSize: 12, color: "#666" },
  staticHandicap: { backgroundColor: "#e0e0e0", padding: 10, borderRadius: 8, fontSize: 16, color: "#666" },
  saveButton: { backgroundColor: "#434371", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 20 },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default EditProfileScreen;
