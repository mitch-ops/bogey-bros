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
import golfBackground from '../../assets/GolfballBackground.png'

const ProfileScreen = ({navigation}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Avatar and Name area*/}
      <Image style={styles.avatar} source={require('../../assets/golferprofile.jpg')} />
      <View style={styles.nameView}>
        <Text style={styles.nameText}>First name</Text>
        <Text style={styles.nameText}>Last name</Text>
      </View>
      <TouchableOpacity 
        style={styles.editProfile} 
        onPress={() =>
          navigation.navigate('EditView')
        }
      >
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Bio Area*/}
      <View style={styles.bioView}>
        <Text style={styles.header}>Bio:</Text>
        <View style={styles.bioBodyContainer}>
          <Text style={styles.bioBodyText}>
            ⛳️ Pro Golfer | ⛅️ Chasing Birdies{"\n"}
            🏆 5 | 🔥 Always on Par{"\n"}
            📍 Dallas | 💪 Never Stop Grinding{"\n"}
            🌍 TGR Foundation{"\n"}
            📩 DM for sponsorships & collabs
          </Text>
        </View>
      </View>

      {/* Handicap */}
      <View style={styles.handicapContainer}>
        <Text style={styles.header}>Handicap</Text>
        <ImageBackground style={styles.handicapImage} source={golfBackground}>
          <Text style={styles.handicapText}>23.1</Text>
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
