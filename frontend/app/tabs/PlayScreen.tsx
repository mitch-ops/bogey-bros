import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { PlayStackParamList } from "../navigation/TabNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import friendsService from "../services/friendsService";
import gameService, { GameInvite } from "../services/gameService";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { createSocketForUser, getSocket } from "../utils/socketUtils";
import HttpHelper from "../utils/HttpHelper";
//friend
type Friend = {
  id: string;
  username: string;
  avatar: string;
  handicap: number;
};

//course
type Course = {
  id: string;
  name: string;
};

type PlayScreenNavigationProp = StackNavigationProp<
  PlayStackParamList,
  "PlayMain"
>;

const PlayScreen = () => {
  // Naviagation and auth
  const navigation = useNavigation<PlayScreenNavigationProp>();
  const { authState, refreshAuthToken } = useAuth();

  // Game settings
  const [betEnabled, setBetEnabled] = useState(true);
  const [selectedMode, setSelectedMode] = useState("Strokeplay");
  const [stake, setStake] = useState(7);
  const [course, setCourse] = useState("");
  const [gameName, setGameName] = useState("");

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Friends state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Game invites state
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [invitesModalVisible, setInvitesModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);

  // Friend selection modal state
  const [friendSearchModalVisible, setFriendSearchModalVisible] =
    useState(false);
  const [friendSearch, setFriendSearch] = useState("");

  // course api address need be added
  const COURSE_API_URL = "https://course api";

  // friend api address need be added
  const FRIENDS_API_URL = "https://friend api";

  // token need be added
  const AUTH_TOKEN = "token";

  useEffect(() => {
    const mockCourses = [
      { id: "1", name: "Pebble Beach" },
      { id: "2", name: "Augusta National" },
      { id: "3", name: "St Andrews" },
    ];
    setCourses(mockCourses);
    setLoadingCourses(false);
  }, []);

  // Load friends data
  const loadFriends = useCallback(async () => {
    await refreshAuthToken!();
    if (!authState?.authenticated) return;

    setLoadingFriends(true);
    try {
      const friendsData = await friendsService.getFriends();
      // console.log("Loaded friends:", friendsData);
      const mappedFriends = friendsData.map((friend) => ({
        id: friend.id,
        username: friend.username || "Unknown", // Ensure 'username' exists
        avatar: friend.avatar || "",
        handicap: friend.handicap || 0,
      }));
      setFriends(mappedFriends);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load friends. Please try again.");
    } finally {
      setLoadingFriends(false);
    }
  }, [authState?.authenticated]);

  // Load game invites
  const loadGameInvites = useCallback(async () => {
    await refreshAuthToken!();
    if (!authState?.authenticated) return;

    setLoadingInvites(true);
    try {
      const invitesData = await gameService.getPendingGameInvites();
      console.log("Loaded game invites:", invitesData);
      setGameInvites(invitesData);
    } catch (error) {
      console.error("Error loading game invites:", error);
    } finally {
      setLoadingInvites(false);
      setRefreshing(false);
    }
  }, [authState?.authenticated]);

  // Load initial data
  useEffect(() => {
    loadFriends();
    loadGameInvites();

    // Generate a default game name based on date
    const today = new Date();
    setGameName(`Game ${today.toLocaleDateString()}`);
  }, [loadFriends, loadGameInvites]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFriends();
    loadGameInvites();
  }, [loadFriends, loadGameInvites]);

  // Toggle friend selection
  const toggleFriendSelection = (friend: Friend) => {
    if (selectedFriends.some((f) => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleAcceptInvite = async (invite: GameInvite) => {
    try {
      setIsAccepting(true);

      console.log("Invite object:", invite);

      // Extract the username string from the invite object
      const senderUsername = invite.senderId?.username;

      // Make sure we have the sender's username
      if (!senderUsername) {
        console.error("Missing senderUsername in invite object:", invite);
        Alert.alert("Error", "Missing sender information. Please try again.");
        return;
      }

      console.log(`Accepting game invite from username: ${senderUsername}`);

      // Get current socket ID
      let socketId = null;
      const socket = getSocket();

      if (socket && socket.connected) {
        socketId = socket.id;
        console.log("Using existing socket ID:", socketId);
      } else {
        // Create a new socket connection if one doesn't exist
        try {
          console.log("Creating new socket connection...");
          socketId = await createSocketForUser();
          console.log("New socket connection established with ID:", socketId);
        } catch (socketError) {
          console.warn("Failed to establish socket connection:", socketError);
          // Continue without socket ID as fallback
        }
      }

      // Accept the invite through the API with the username string
      const response = await gameService.acceptGameInvite(
        senderUsername,
        socketId
      );
      console.log("Accept invite response:", response);

      // Extract game data from the response
      const game = response.game;
      const userInfoFromApi = await HttpHelper.get('/user', authState!.token);

      const currentUser = {
        id: userInfoFromApi._id,
        username: userInfoFromApi.username,
        handicap: userInfoFromApi.handicap,
        avatar: userInfoFromApi.profilePicture,
      };
      
      if (game) {
        // Prepare player list
        // Since we don't have player details from the game object,
        // we'll create placeholder objects for now
        const players = game.participants.map(
          (participantId: string, index: number) => {
            // For the current user
            if (participantId === currentUser.id) {
              return {
                id: currentUser.id,
                username: currentUser.username,
                handicap: currentUser.handicap,
                avatar: currentUser.avatar,
              };
            }

            // For the sender
            if (index === 0) {
              // Assuming first participant is the sender
              return {
                id: invite.senderId,
                username: senderUsername,
                handicap: "0", // We don't have this data
              };
            }

            // For other participants
            return {
              id: participantId,
              username: `Player ${index + 1}`, // Placeholder
              handicap: "0", // Placeholder
            };
          }
        );

        // Navigate to the LiveGame screen
        navigation.navigate("LiveGame", {
          gameMode: game.mode,
          stake: game.pot / game.participants.length, // Per-player stake
          course: game.courseName,
          betEnabled: game.pot > 0,
          players: players,
          game: game, // Pass the entire game object
          gameName: game.gameName, // To identify the game
          gameCreator: false
        });

        // Close the invites modal
        setInvitesModalVisible(false);

        // Refresh invites in the background
        loadGameInvites();
      } else {
        // If we don't have game data, just show a success message
        Alert.alert(
          "Success",
          `You've accepted ${senderUsername}'s invitation and joined the game.`
        );
        setInvitesModalVisible(false);
      }
    } catch (error) {
      console.error("Error accepting game invite:", error);
      Alert.alert("Error", "Failed to accept game invite. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectInvite = async (invite: GameInvite) => {
    try {
      setIsRejecting(invite._id || invite.id || null);

      console.log("Invite object:", invite);

      const senderUsername = invite.senderId?.username;

      // Make sure we have the sender's username
      if (!senderUsername) {
        console.error("Missing senderUsername in invite object:", invite);
        Alert.alert("Error", "Missing sender information. Please try again.");
        return;
      }

      console.log(`Rejecting game invite from username: ${senderUsername}`);

      // Reject the invite through the API with the username string
      await gameService.rejectGameInvite(senderUsername);

      Alert.alert(
        "Invite Rejected",
        `You've declined ${senderUsername}'s game invitation.`
      );

      // Refresh invites
      loadGameInvites();
    } catch (error) {
      console.error("Error rejecting game invite:", error);
      Alert.alert("Error", "Failed to reject game invite. Please try again.");
    } finally {
      setIsRejecting(null);
    }
  };

  // Send game invites to selected friends
  const sendGameInvites = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert(
        "No Players Selected",
        "Please select at least one friend to invite."
      );
      return;
    }

    if (!course) {
      Alert.alert("Missing Course", "Please select a course for the game.");
      return;
    }

    try {
      // Get usernames of selected friends
      const usernames = selectedFriends.map((friend) => friend.username);

      // Send invites
      await gameService.sendGameInvites(
        usernames,
        stake,
        selectedMode as any,
        gameName || `Game ${new Date().toLocaleDateString()}`,
        course
      );

      Alert.alert(
        "Invites Sent",
        `Game invites sent to ${usernames.join(", ")}.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Clear selections after successful invites
              setSelectedFriends([]);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error sending game invites:", error);
      Alert.alert("Error", "Failed to send game invites. Please try again.");
    }
  };

  // Render invites modal
  const renderInvitesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={invitesModalVisible}
      onRequestClose={() => setInvitesModalVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Game Invitations
          </Text>

          {loadingInvites ? (
            <ActivityIndicator size="large" color="#494373" />
          ) : gameInvites.length === 0 ? (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              No pending game invitations
            </Text>
          ) : (
            <FlatList
              data={gameInvites}
              keyExtractor={(item) => item.id || ""}
              renderItem={({ item }) => {
                console.log("Rendering invite item:", item);
                return (
                  <View
                    style={{
                      padding: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                      From: {item.senderId?.username || "Unknown"}
                    </Text>
                    <Text style={{ marginVertical: 3 }}>
                      Course: {item.course || "Unknown Course"}
                    </Text>
                    <Text style={{ marginVertical: 3 }}>
                      Mode: {item.mode || "Unknown Mode"}
                    </Text>
                    {item.stake > 0 && (
                      <Text style={{ marginVertical: 3 }}>
                        Stake: ${item.stake}
                      </Text>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 10,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#ccc",
                          padding: 8,
                          borderRadius: 5,
                          marginRight: 10,
                          opacity:
                            isRejecting === item.id || isAccepting ? 0.5 : 1,
                        }}
                        onPress={() => {
                          console.log("Reject button pressed for:", item);
                          handleRejectInvite(item);
                        }}
                        disabled={isRejecting === item.id || isAccepting}
                      >
                        {isRejecting === item.id ? (
                          <ActivityIndicator size="small" color="#333" />
                        ) : (
                          <Text>Decline</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#494373",
                          padding: 8,
                          borderRadius: 5,
                          opacity:
                            isAccepting || isRejecting === item.id ? 0.5 : 1,
                        }}
                        onPress={() => {
                          console.log("Accept button pressed for:", item);
                          handleAcceptInvite(item);
                        }}
                        disabled={isAccepting || isRejecting === item.id}
                      >
                        {isAccepting ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={{ color: "white" }}>Accept</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#494373"]}
                />
              }
            />
          )}

          <TouchableOpacity
            style={{
              backgroundColor: "#494373",
              padding: 12,
              borderRadius: 5,
              marginTop: 15,
              alignItems: "center",
            }}
            onPress={() => setInvitesModalVisible(false)}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render friend search modal
  const renderFriendSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={friendSearchModalVisible}
      onRequestClose={() => setFriendSearchModalVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Select Friends
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Search friends..."
            value={friendSearch}
            onChangeText={setFriendSearch}
          />

          {loadingFriends ? (
            <ActivityIndicator size="large" color="#494373" />
          ) : friends.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                marginVertical: 20,
                color: "#666",
              }}
            >
              You don't have any friends yet
            </Text>
          ) : (
            <FlatList
              data={
                friendSearch
                  ? friends.filter((friend) =>
                      friend.username
                        .toLowerCase()
                        .includes(friendSearch.toLowerCase())
                    )
                  : friends
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                    },
                    selectedFriends.some((f) => f.id === item.id) && {
                      backgroundColor: "#e0dfff",
                    },
                  ]}
                  onPress={() => toggleFriendSelection(item)}
                >
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${item.avatar}` }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 10,
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                      }}
                    >
                      {item.username}
                    </Text>
                    <Text
                      style={{
                        color: "#666",
                        fontSize: 14,
                      }}
                    >
                      Handicap: {item.handicap || "N/A"}
                    </Text>
                  </View>
                  {selectedFriends.some((f) => f.id === item.id) && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#494373",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 15,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#ccc",
                padding: 12,
                borderRadius: 5,
                flex: 1,
                marginRight: 10,
                alignItems: "center",
              }}
              onPress={() => setFriendSearchModalVisible(false)}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                {
                  backgroundColor: "#494373",
                  padding: 12,
                  borderRadius: 5,
                  flex: 1,
                  alignItems: "center",
                },
                selectedFriends.length === 0 && styles.disabledButton,
              ]}
              disabled={selectedFriends.length === 0}
              onPress={() => {
                setFriendSearchModalVisible(false);
                // Don't clear selections here as we want to keep them for the game setup
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Done ({selectedFriends.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // HandleBeginRound function
  const handleBeginRound = async () => {
    // Validate required information
    if (!course) {
      Alert.alert(
        "Missing Information",
        "Please select a course for your round."
      );
      return;
    }

    await refreshAuthToken!();
    // Ensure we have a game name
    const effectiveGameName =
      gameName || `${course} - ${new Date().toLocaleDateString()}`;

    // Get or create socket connection
    let socketId = null;
    const socket = getSocket();

    if (socket && socket.connected) {
      socketId = socket.id;
      console.log("Using existing socket ID for game creation:", socketId);
    } else {
      try {
        console.log("Creating new socket connection for game creation...");
        socketId = await createSocketForUser();
        console.log("New socket connection established with ID:", socketId);
      } catch (socketError) {
        console.warn("Failed to establish socket connection:", socketError);
        // Continue without socket ID as fallback
      }
    }
    // Create a player object for the current user
    const userInfoFromApi = await HttpHelper.get('/user', authState!.token);

    const currentUser = {
      id: userInfoFromApi._id,
      username: userInfoFromApi.username,
      handicap: userInfoFromApi.handicap,
      avatar: userInfoFromApi.profilePicture,
    };

    // For solo play (no friends selected)
    if (selectedFriends.length === 0) {
      try {
        setIsSending(true);

        // For solo play, send an empty array - no invites needed
        const response = await gameService.sendGameInvites(
          [], // Empty array - no invites sent
          betEnabled ? stake : 0,
          selectedMode as any,
          effectiveGameName,
          course,
          socketId
        );

        // Get the created game
        const game = response.savedGame;


        // Navigate to the LiveGame screen
        navigation.navigate("LiveGame", {
          gameMode: selectedMode,
          stake: betEnabled ? stake : 0,
          course: course,
          betEnabled: betEnabled,
          players: [currentUser],
          game: game, // Pass the entire game object
          gameName: effectiveGameName, // To identify the game
          gameCreator: true,
        });
      } catch (error) {
        console.error("Error creating solo game:", error);
        Alert.alert("Error", "Failed to create game. Please try again.");
      } finally {
        setIsSending(false);
      }

      return;
    }

    // Otherwise, send invites to selected friends
    try {
      setIsSending(true);

      // Get IDs of selected friends (not usernames)
      const friendUsernames = selectedFriends.map((friend) => friend.username);
      // Send the invites (which will create a game on the backend)
      // This will convert the IDs to usernames internally
      const response = await gameService.sendGameInvites(
        friendUsernames,
        stake,
        selectedMode as any,
        effectiveGameName,
        course,
        socketId
      );

      // Get the created game
      const game = response.savedGame;

      if (game) {

        // Create player objects for invited friends
        // These are placeholders since they haven't accepted yet
        const pendingPlayers = selectedFriends.map((friend) => ({
          ...friend,
          pending: true, // Mark as pending
        }));

        Alert.alert(
          "Game Created",
          `Invites sent to ${selectedFriends.length} players. You can start playing, and others will join as they accept.`,
          [
            {
              text: "Start Now",
              onPress: () => {
                // Navigate to the LiveGame screen
                navigation.navigate("LiveGame", {
                  gameMode: selectedMode,
                  stake: stake,
                  course: course,
                  betEnabled: betEnabled,
                  players: [currentUser, ...pendingPlayers],
                  game: game, // Pass the entire game object
                  gameName: effectiveGameName, // To identify the game
                  gameCreator: true,
                });

                // Clear selections
                setSelectedFriends([]);
              },
            },
            {
              text: "Wait for Others",
              onPress: () => {
                // Just clear selections and stay on the current screen
                setSelectedFriends([]);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Invites Sent",
          `Game invites sent to ${selectedFriends.length} players.`,
          [{ text: "OK", onPress: () => setSelectedFriends([]) }]
        );
      }
    } catch (error) {
      console.error("Error sending game invites:", error);
      Alert.alert("Error", "Failed to create game. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      {/* Header with notifications */}
      <View>
        {gameInvites.length > 0 && (
          <TouchableOpacity
            style={{
              position: "relative",
              padding: 8,
            }}
            onPress={() => setInvitesModalVisible(true)}
          >
            <Ionicons name="mail" size={24} color="#494373" />
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                backgroundColor: "red",
                width: 20,
                height: 20,
                borderRadius: "center",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {gameInvites.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Game name input */}
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
        Game Name
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 16,
        }}
        placeholder="Enter game name..."
        value={gameName}
        onChangeText={setGameName}
      />

      {/* Bet Toggle */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#eee",
          borderRadius: 30,
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {setBetEnabled(false); setStake(0);}}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 30,
            backgroundColor: !betEnabled ? "#494373" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ color: !betEnabled ? "white" : "black" }}>No bet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {setBetEnabled(true); setStake(7)}}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 30,
            backgroundColor: betEnabled ? "#494373" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ color: betEnabled ? "white" : "black" }}>Bet</Text>
        </TouchableOpacity>
      </View>

      {/* Select Mode */}
      {betEnabled && (
        <>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Select Mode</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginVertical: 10,
            }}
          >
            {["Strokeplay", "Matchplay", "Skin", "Wolf"].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setSelectedMode(mode)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: selectedMode === mode ? "#494373" : "#ddd",
                  margin: 4,
                }}
              >
                <Text
                  style={{ color: selectedMode === mode ? "white" : "black" }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Stake */}
      {betEnabled && (
        <>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Stake</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setStake(Math.max(1, stake - 1))}
              style={{ padding: 10 }}
            >
              <Text style={{ fontSize: 18 }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, marginHorizontal: 10 }}>${stake}</Text>
            <TouchableOpacity
              onPress={() => setStake(stake + 1)}
              style={{ padding: 10 }}
            >
              <Text style={{ fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Select Course */}
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Select Course</Text>
      {loadingCourses ? (
        <ActivityIndicator size="small" color="#494373" />
      ) : (
        <View
          style={{
            marginVertical: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <TextInput
            placeholder="Find a Course..."
            value={course}
            onChangeText={setCourse}
            style={{ height: 40 }}
          />
          {course.length > 0 &&
            courses
              .filter((c) =>
                c.name.toLowerCase().includes(course.toLowerCase())
              )
              .map((c) => (
                <TouchableOpacity key={c.id} onPress={() => setCourse(c.name)}>
                  <Text style={{ paddingVertical: 4 }}>{c.name}</Text>
                </TouchableOpacity>
              ))}
        </View>
      )}

      {/* Friends Section */}
      <View style={styles.friendsHeader}>
        <Text style={styles.sectionTitle}>Add Friends</Text>
        <Text style={styles.selectedCount}>
          {selectedFriends.length > 0
            ? `Selected: ${selectedFriends.length}`
            : ""}
        </Text>
      </View>

      {loadingFriends ? (
        <ActivityIndicator
          size="large"
          color="#494373"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {/* Selected friends */}
          {selectedFriends.length > 0 && (
            <View style={styles.selectedFriendsContainer}>
              {selectedFriends.map((friend) => (
                <View key={friend.id} style={styles.selectedFriendChip}>
                  <Text style={styles.selectedFriendText} numberOfLines={1}>
                    {friend.username}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFriendSelection(friend)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Friend Search button */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
            }}
            onPress={() => setFriendSearchModalVisible(true)}
          >
            <Text style={{ fontSize: 24, marginRight: 8 }}>＋</Text>
            <Text style={{ color: "#555" }}>Add Friend...</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Begin Round Button */}
      <TouchableOpacity
        style={{
          marginTop: 30,
          backgroundColor: "#494373",
          padding: 16,
          borderRadius: 30,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        onPress={() => handleBeginRound()}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Begin Round!</Text>
      </TouchableOpacity>
      {/* Render modals */}
      {renderInvitesModal()}
      {renderFriendSearchModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: "#9e9db1",
  },
  friendsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  selectedCount: {
    color: "#666",
    fontSize: 14,
  },
  selectedFriendsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  selectedFriendChip: {
    backgroundColor: "#494373",
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    margin: 3,
    maxWidth: 150,
  },
  selectedFriendText: {
    color: "white",
    marginRight: 5,
    fontSize: 14,
  },
  removeButton: {
    padding: 3,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 5,
  },
  addFriendText: {
    marginLeft: 5,
    color: "#555",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default PlayScreen;
