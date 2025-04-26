import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import friendsService, {
  Friend,
  FriendRequest,
} from "../services/friendsService";
import { useAuth } from "../context/AuthContext";

const FriendsScreen = () => {
  const { authState, refreshAuthToken} = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load data if user is authenticated
    if (authState?.authenticated) {
      loadData();
    }
  }, [authState?.authenticated]);

  const loadData = async () => {
    await refreshAuthToken!();
    
    if (!authState?.authenticated) {
      setError("You must be logged in to view friends");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading friends data...");

      // First try to load friends
      let friendsData;
      try {
        friendsData = await friendsService.getFriends();
        console.log("Friends Data: ", friendsData)
        console.log("Friends data loaded:", friendsData.length);
        setFriends(friendsData);
      } catch (friendsError) {
        console.error("Error loading friends data:", friendsError);
      }

      // Then try to load friend requests
      try {
        const pendingData = await friendsService.getPendingRequests();
        console.log("Pending requests loaded:", pendingData.length);
        setPendingRequests(pendingData);
      } catch (requestsError) {
        console.log("Error loading friend requests:", requestsError);

        // Only set error if both operations failed
        if (!friendsData) {
          setError("Failed to load friend data. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error in loadData:", error);
      setError("Failed to load friend data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendRequest = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setIsSending(true);
    try {
      console.log(`Sending friend request to: ${username}`);
      await friendsService.sendFriendRequest(username.trim());
      Alert.alert("Success", `Friend request sent to ${username}`);
      setUsername("");
      setIsModalVisible(false);
    } catch (error: any) {
      console.error("Error sending friend request:", error);

      // More specific error message based on the error
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send friend request. Please try again.";

      Alert.alert("Error", errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleAcceptRequest = async (username: string) => {
    try {
      console.log(`Accepting friend request from username: ${username}`); // DEBUG

      // Show loading state
      setIsLoading(true);

      // Api call
      await friendsService.acceptFriendRequest(username);

      // Show success message
      Alert.alert("Success", `You are now friends with ${username}`);

      // Reload data to update the UI
      await loadData();
    } catch (error: any) {
      console.error("Error accepting friend request:", error);

      // Show appropriate error message based on the error
      let errorMessage = "Failed to accept friend request. Please try again.";

      // Check if we have a more specific error from the API
      if (error.message && error.message.includes("404")) {
        if (error.message.includes("Sender not found")) {
          errorMessage = `User "${username}" could not be found. They may have deleted their account.`;
        } else if (error.message.includes("Friend request not found")) {
          errorMessage = `No pending request found from ${username}. It may have been cancelled or already processed.`;

          // refresh the list to get the current state
          loadData();
        }
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (username: string) => {
    try {
      console.log(`Rejecting friend request from: ${username}`);
      await friendsService.rejectFriendRequest(username);
      Alert.alert("Success", `Friend request from ${username} rejected`);
      loadData(); // Reload data to update the UI
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      Alert.alert(
        "Error",
        "Failed to reject friend request. Please try again."
      );
    }
  };

  const renderAddFriendModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Friend</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setUsername("");
                setIsModalVisible(false);
              }}
              disabled={isSending}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.sendButton]}
              onPress={handleSendRequest}
              disabled={isSending || !username.trim()}
            >
              {isSending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPendingRequestsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isRequestsModalVisible}
      onRequestClose={() => setIsRequestsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Friend Requests</Text>
          {pendingRequests.length === 0 ? (
            <Text style={styles.noRequestsText}>
              No pending friend requests
            </Text>
          ) : (
            <ScrollView style={styles.requestsList}>
              {pendingRequests.map((request) => (
                <View
                  key={request.id || request.senderId}
                  style={styles.requestItem}
                >
                  <Text style={styles.requestUsername}>{request.username}</Text>
                  <View style={styles.requestButtons}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(request.username)}
                    >
                      <Text style={styles.requestButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(request.username)}
                    >
                      <Text style={styles.requestButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsRequestsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // If user is not authenticated
  if (!authState?.authenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Friends</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please log in to view your friends
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.requestsButton}
            onPress={() => setIsRequestsModalVisible(true)}
          >
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
            <Ionicons name="notifications-outline" size={24} color="#434371" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.friendCount}>{friends.length} Friends</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#434371" />
        </View>
      ) : (
        <>
          {error && friends.length === 0 && pendingRequests.length === 0 ? (
            // Only show error if we have no data at all
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {friends.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    You don't have any friends yet.
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Send a friend request to get started!
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={() => setIsModalVisible(true)}
                  >
                    <Text style={styles.emptyAddButtonText}>Add Friend</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                >
                  {friends.map((friend) => (
                    <View key={friend.id} style={styles.friendCard}>
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${friend.avatar}` }}
                        style={styles.friendImage}
                      />
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.firstname} {friend.lastname}</Text>
                        <Text style={styles.friendHandicap}>
                          Handicap: {friend.handicap}
                        </Text>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <ActivityIndicator color="#434371" size="small" />
                    ) : (
                      <Text style={styles.refreshButtonText}>Refresh</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              )}
            </>
          )}
        </>
      )}

      {renderAddFriendModal()}
      {renderPendingRequestsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestsButton: {
    padding: 8,
    marginRight: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#434371",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: "white",
    fontWeight: "500",
  },
  friendCount: {
    marginLeft: 16,
    marginBottom: 8,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#434371",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: "#434371",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  friendImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
  },
  friendInfo: {
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  friendHandicap: {
    fontSize: 14,
    color: "#666",
  },
  refreshButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  refreshButtonText: {
    color: "#434371",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  sendButton: {
    backgroundColor: "#434371",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noRequestsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  requestsList: {
    maxHeight: 300,
  },
  requestItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  requestUsername: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  requestButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#434371",
  },
  rejectButton: {
    backgroundColor: "#ccc",
  },
  requestButtonText: {
    color: "white",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#434371",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default FriendsScreen;
