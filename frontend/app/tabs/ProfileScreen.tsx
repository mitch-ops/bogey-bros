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
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import { API_URL } from "../context/AuthContext";
import golfBackground from '../../assets/GolfballBackground.png';
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("Loading...");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("Loading bio...");
  const [handicap, setHandicap] = useState("...");
  const { authState } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${API_URL}/user`);
          const data = res.data;
          console.log("User data:", data); // For debugging

          // If firstName is empty or not provided, default to "firstname"
          const userFirstName =
            !data.firstName || data.firstName.trim() === ""
              ? "firstname"
              : data.firstName;
          // If lastName is empty or not provided, default to "lastname"
          const userLastName =
            !data.lastName || data.lastName.trim() === ""
              ? "lastname"
              : data.lastName;

          setFirstName(userFirstName);
          setLastName(userLastName);
          setBio(data.bio || "No bio added yet.");
          setHandicap(data.handicap?.toString() || "N/A");
        } catch (err) {
          console.error("Failed to load user data", err);
        }
      };

      if (authState?.authenticated) {
        fetchUserData();
      }
    }, [authState])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar and Name area */}
      <Image
        style={styles.avatar}
        source={require('../../assets/golferprofile.jpg')}
      />
      <View style={styles.nameView}>
        <Text style={styles.nameText}>{firstName}</Text>
        <Text style={styles.nameText}>{lastName}</Text>
      </View>

      <TouchableOpacity
        style={styles.editProfile}
        onPress={() => navigation.navigate('EditView')}
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Bio Area */}
      <View style={styles.bioView}>
        <Text style={styles.header}>Bio:</Text>
        <View style={styles.bioBodyContainer}>
          <Text style={styles.bioBodyText}>{bio}</Text>
        </View>
      </View>

      {/* Handicap */}
      <View style={styles.handicapContainer}>
        <Text style={styles.header}>Handicap</Text>
        <ImageBackground style={styles.handicapImage} source={golfBackground}>
          <Text style={styles.handicapText}>{handicap}</Text>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center"
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#434371", 
    justifyContent: "center",
    alignItems: "center",
  },
  nameView: {
    flexDirection: "row"
  },
  nameText: {
    padding: 10,
    fontSize: 20,
  },
  bioView: {
    alignItems: "flex-start",
    paddingTop: 20,
    width: "90%",
  },
  header: {
    padding: 5,
    fontSize: 20,
  },
  bioBodyContainer: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  bioBodyText: {
    fontSize: 16,
    lineHeight: 16 * 1.3,
  },
  editProfile: {
    backgroundColor: "#434371",
    paddingHorizontal: 30,
    padding: 2,
    borderRadius: 5,
  },
  editText: {
    fontSize: 20,
    color: "white",
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
    fontSize: 40
  }
});

export default ProfileScreen;
