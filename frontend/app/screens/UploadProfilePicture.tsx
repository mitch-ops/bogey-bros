import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker'; // we'll use expo-document-picker
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const UploadProfilePicture = () => {
  const [image, setImage] = useState<any>(null);
  const { authState } = useAuth();
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', {
      uri: image.uri,
      name: image.name,
      type: image.mimeType || "image/jpeg",
    } as any);

    try {
      const response = await fetch(`${API_URL}/user/profilePicture`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState?.token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      Alert.alert("Success", "Profile picture updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error uploading profile picture");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload New Profile Picture</Text>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={styles.preview}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
        <Text style={styles.buttonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#434371" },
  header: { color: "white", fontSize: 22, marginBottom: 20 },
  preview: { width: 200, height: 200, borderRadius: 100, marginBottom: 20 },
  button: { backgroundColor: "#5D5C8D", padding: 10, borderRadius: 10, marginBottom: 10 },
  uploadButton: { backgroundColor: "#1E1E3F", padding: 10, borderRadius: 10 },
  buttonText: { color: "white", fontSize: 16 },
});

export default UploadProfilePicture;
