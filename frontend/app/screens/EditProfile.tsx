import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

import pfp from '../../assets/defaultpfp.jpg'

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
        <Image source={pfp} style={styles.avatar}></Image>
        <TouchableOpacity>
            <Text style={styles.editProfilePicText}>Change Picture</Text>
        </TouchableOpacity>
    </View>
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
  },
  editProfilePicText: {
    paddingTop: 15,
    color: "#434371",
    fontWeight: "bold", 
  }

});

export default ProfileScreen;
