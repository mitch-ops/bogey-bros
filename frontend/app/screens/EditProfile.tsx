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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_URL, useAuth } from "../context/AuthContext";
import defaultAvatar from "../../assets/defaultpfp.jpg";

const EditProfileScreen = ({ navigation }) => {
  const { authState, refreshAuthToken } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [handicap, setHandicap] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      });

      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setUsername(data.username || "");
      setBio(data.bio || "");
      setHandicap(data.handicap?.toString() || "N/A");
      if (data.profilePicture) {
        setAvatarUri(`data:image/jpeg;base64,${data.profilePicture}`);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      Alert.alert("Error", "Could not load user profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!authState?.authenticated) return;

      try {
        await refreshAuthToken?.();
        await fetchUserProfile();
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initialize();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need access to your photos to update your profile picture.");
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

  const uploadAvatar = async (uri: string) => {
    try {
      const filename = uri.split("/").pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
      formData.append("profilePicture", {
        uri,
        name: filename,
        type: mimeType,
      } as any);

      await axios.put(`${API_URL}/user/profilePicture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState?.token}`,
        },
      });

      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload avatar error:", err);
      Alert.alert("Error", "Could not upload profile picture.");
    }
  };

  const handleSave = async () => {
    try {
      const updateFields = { firstName, lastName, username, bio };
      await axios.put(`${API_URL}/user`, updateFields, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      });

      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Save profile error:", err);
      Alert.alert("Error", "Something went wrong while saving your profile.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={pickImage}>
        <Image source={avatarUri ? { uri: avatarUri } : defaultAvatar} style={styles.avatar} />
        <Text style={styles.changeText}>Change Picture</Text>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor="#A9A9C8" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor="#A9A9C8" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Username:</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor="#A9A9C8" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bio:</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          multiline
          maxLength={280}
          value={bio}
          onChangeText={setBio}
          placeholder="Write something about yourself..."
          placeholderTextColor="#A9A9C8"
        />
        <Text style={styles.charCounter}>{bio.length}/280</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Handicap:</Text>
        <Text style={styles.staticHandicap}>{handicap}</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#434371",
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#5D5C8D",
    marginBottom: 10,
  },
  changeText: {
    textAlign: "center",
    color: "#A9A9C8",
    fontWeight: "bold",
    marginBottom: 30,
  },
  field: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#5D5C8D",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#FFFFFF",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  charCounter: {
    alignSelf: "flex-end",
    marginRight: 10,
    fontSize: 12,
    color: "#D3D3D3",
  },
  staticHandicap: {
    backgroundColor: "#5D5C8D",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#1E1E3F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#434371",
  },
});

export default EditProfileScreen;
