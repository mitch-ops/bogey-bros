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
import axios from "axios";
import { API_URL } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import pfp from '../../assets/defaultpfp.jpg';

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [handicap, setHandicap] = useState("");
  const { authState } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${API_URL}/user`);
        const data = res.data;
        setUsername(data.username || "");
        setBio(data.bio || "");
        setHandicap(data.handicap?.toString() || "N/A");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (authState?.authenticated) {
      fetchUserData();
    }
  }, [authState]);

  const handleSave = async () => {
    try {
      const updateFields: any = {
        username,
        bio
      };
      console.log("Updating with:", updateFields);
      const res = await axios.put(`${API_URL}/user`, updateFields);
      console.log("Update successful:", res.data);
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Something went wrong while updating your profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={pfp} style={styles.avatar} />
      <TouchableOpacity>
        <Text style={styles.editProfilePicText}>Change Picture</Text>
      </TouchableOpacity>

      {/* Username Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Bio Field */}
      <View style={styles.field}>
        <Text style={styles.label}>Bio:</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          multiline
          value={bio}
          onChangeText={setBio}
        />
      </View>

      {/* Handicap Display Only */}
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
    padding: 20,
    alignItems: "center"
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#434371",
    marginBottom: 10,
  },
  editProfilePicText: {
    paddingBottom: 30,
    color: "#434371",
    fontWeight: "bold",
  },
  field: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  staticHandicap: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#434371",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfileScreen;
