import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";

const PlayPage = ({ navigation }: any) => {
  const [isBet, setIsBet] = useState(true);
  const [mode, setMode] = useState("Strokeplay");
  const [stake, setStake] = useState(7);
  const [course, setCourse] = useState("");

  const friends = [
    {
      name: "A",
      handicap: "23.2",
      avatar: require("../assets/avatar1.png"),
    },
  ];

  const increaseStake = () => setStake((prev) => prev + 1);
  const decreaseStake = () => setStake((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Play</Text>

      {/* Bet Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isBet && styles.toggleButtonActiveLeft]}
          onPress={() => setIsBet(false)}
        >
          <Text style={[styles.toggleText, !isBet && styles.toggleTextActive]}>
            No bet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isBet && styles.toggleButtonActiveRight]}
          onPress={() => setIsBet(true)}
        >
          <Text style={[styles.toggleText, isBet && styles.toggleTextActive]}>
            Bet
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select Mode */}
      <Text style={styles.sectionTitle}>Select Mode</Text>
      <View style={styles.modeContainer}>
        {["Strokeplay", "Matchplay", "Skin", "Wolf"].map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.modeButton,
              mode === m && styles.modeButtonActive,
            ]}
            onPress={() => setMode(m)}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === m && styles.modeButtonTextActive,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stake */}
      <Text style={styles.sectionTitle}>Stake</Text>
      <View style={styles.stakeContainer}>
        <TouchableOpacity style={styles.stakeAdjust} onPress={decreaseStake}>
          <Text style={styles.stakeAdjustText}>˅</Text>
        </TouchableOpacity>
        <Text style={styles.stakeAmount}>${stake}</Text>
        <TouchableOpacity style={styles.stakeAdjust} onPress={increaseStake}>
          <Text style={styles.stakeAdjustText}>˄</Text>
        </TouchableOpacity>
      </View>

      {/* Select Course */}
      <Text style={styles.sectionTitle}>Select Course</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Find a Course..."
          value={course}
          onChangeText={setCourse}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Add Friends */}
      <Text style={styles.sectionTitle}>Add Friends</Text>
      {friends.map((friend, idx) => (
        <View key={idx} style={styles.friendCard}>
          <Image source={friend.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendHandicap}>Handicap {friend.handicap}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addFriend}>
        <Text style={styles.addFriendText}>＋ Add Friend...</Text>
      </TouchableOpacity>

      {/* Begin Round */}
      <TouchableOpacity
        style={styles.beginButton}
        onPress={() => navigation.navigate("LiveGame")} // 确保在 App.tsx 中注册了 LiveGame 页面
      >
        <Text style={styles.beginButtonText}>Begin Round!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleButtonActiveLeft: {
    backgroundColor: "#D0CFEF",
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  toggleButtonActiveRight: {
    backgroundColor: "#5C4DB1",
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
  },
  toggleText: {
    fontSize: 16,
    color: "#555",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  modeButton: {
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  modeButtonActive: {
    backgroundColor: "#5C4DB1",
    borderColor: "#5C4DB1",
  },
  modeButtonText: {
    color: "#333",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  stakeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    width: 100,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stakeAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stakeAdjust: {
    paddingHorizontal: 6,
  },
  stakeAdjustText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    fontSize: 18,
    color: "#999",
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
  },
  friendName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  friendHandicap: {
    color: "#666",
    fontSize: 13,
  },
  addFriend: {
    paddingVertical: 12,
  },
  addFriendText: {
    color: "#555",
    fontSize: 16,
  },
  beginButton: {
    backgroundColor: "#5C4DB1",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 30,
  },
  beginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PlayPage;
