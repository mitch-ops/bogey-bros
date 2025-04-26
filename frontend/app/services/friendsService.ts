import HttpHelper from "../utils/HttpHelper";
import httpService from "../utils/HttpHelper";
import * as SecureStore from "expo-secure-store";

// Token key constant
const TOKEN_KEY = "my-jwt";

// Define types
export interface Friend {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  handicap?: number;
  avatar?: string;
}

export interface FriendRequest {
  id: string;
  username: string;
  senderId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

class FriendsService {
  // Get the token from secure storage
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from secure storage:", error);
      return null;
    }
  }

  // Get current user's friends
  // async getFriends(): Promise<Friend[]> {
  //   try {
  //     const token = await this.getToken();

  //     if (!token) {
  //       throw new Error("Authentication token not found");
  //     }

  //     console.log("Fetching current user data...");
  //     // Get the current user profile
  //     const userResponse = await httpService.get("/user/getFriendInfo", token);
  //     console.log("User data:", JSON.stringify(userResponse));

  //     if (
  //       !userResponse ||
  //       !userResponse.friends ||
  //       !Array.isArray(userResponse.friends)
  //     ) {
  //       console.log("No friends array found in user profile");
  //       return [];
  //     }

  //     // If the friends array is empty, return an empty array
  //     if (userResponse.friends.length === 0) {
  //       console.log("User has no friends");
  //       return [];
  //     }

  //     console.log(
  //       `Found ${userResponse.friends.length} friend IDs in user profile`
  //     );

  //     // Extract the friend IDs from the friends array
  //     const friendIds = userResponse.friends
  //       .map((friendId: any) => {
  //         // Handle different possible formats of ObjectId
  //         if (typeof friendId === "string") {
  //           return friendId;
  //         } else if (friendId.$oid) {
  //           return friendId.$oid;
  //         } else if (friendId._id) {
  //           return friendId._id;
  //         } else {
  //           console.log("Unexpected friend ID format:", friendId);
  //           return null;
  //         }
  //       })
  //       .filter(Boolean); // Remove any null values

  //     console.log("Extracted friend IDs:", friendIds);

  //     // Now fetch each friend's details using the new endpoint
  //     const friendsPromises = friendIds.map(async (id) => {
  //       try {
  //         console.log(`Fetching details for friend ID: ${id}`);
  //         const friendData = await httpService.get(`/users/${id}`, token);
  //         console.log(`Friend data for ID ${id}:`, friendData);

  //         return {
  //           id: friendData._id || id,
  //           username: friendData.username || `User ${id.substring(0, 6)}...`,
  //           handicap: friendData.handicap?.toString() || "N/A",
  //           avatar: friendData.avatar,
  //         };
  //       } catch (error) {
  //         console.error(`Error fetching friend ID ${id}:`, error);
  //         // Return a placeholder for failed requests
  //         return {
  //           id: id,
  //           username: `User ${id.substring(0, 6)}...`,
  //           handicap: "N/A",
  //         };
  //       }
  //     });

  //     const friendsResults = await Promise.all(friendsPromises);
  //     console.log("Retrieved friend details:", JSON.stringify(friendsResults));

  //     return friendsResults;
  //   } catch (error) {
  //     console.error("Error fetching friends:", error);
  //     throw error;
  //   }
  // }

  async getFriends(): Promise<Friend[]> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Fetching current user data...");
      // Get the current user profile
      const userResponse = await httpService.get("/user/getFriendInfo", token);
      // console.log("User data:", JSON.stringify(userResponse));

      if (
        !userResponse ||
        !userResponse.friends ||
        !Array.isArray(userResponse.friends)
      ) {
        console.log("No friends array found in user profile");
        return [];
      }

      // If the friends array is empty, return an empty array
      if (userResponse.friends.length === 0) {
        console.log("User has no friends");
        return [];
      }

      console.log(
        `Found ${userResponse.friends.length} friend IDs in user profile`
      );
      
      const formattedFriends: Friend[] = userResponse.friends.map((f: any, index: number) => ({
        id: f.id || `friend-${index}`, // Fallback if no ID provided
        firstname: f.firstName,
        lastname: f.lastName,
        username: f.username,
        handicap: f.handicap,
        avatar: f.profilePicture,
      }));
      
      return formattedFriends;
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw error;
    }
  }

  // Get pending friend requests
  async getPendingRequests(): Promise<FriendRequest[]> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Fetching pending friend requests...");
      const response = await httpService.get("/friends", token);
      console.log("Pending requests raw response:", JSON.stringify(response));

      if (!response) {
        console.log("No pending requests returned");
        return [];
      }

      // If the response is an array, map it to our FriendRequest interface
      if (Array.isArray(response)) {
        console.log(`Found ${response.length} pending requests`);

        // Map response to our interface structure, with detailed logging
        const mappedRequests = response.map((req) => {
          console.log("Processing request:", JSON.stringify(req));

          // The senderId is an object that contains username
          let username = "unknown-user";
          let senderId = "unknown-sender";

          // Extract username from the nested senderId object
          if (req.senderId && typeof req.senderId === "object") {
            if (req.senderId.username) {
              username = req.senderId.username;
            }
            if (req.senderId._id) {
              senderId = req.senderId._id;
            }
          } else if (req.sender && typeof req.sender === "object") {
            if (req.sender.username) {
              username = req.sender.username;
            }
            if (req.sender._id) {
              senderId = req.sender._id;
            }
          }

          // Make sure we have all required fields
          const id = req._id || req.id || "unknown-id";

          console.log(
            `Mapped request: id=${id}, username=${username}, senderId=${senderId}`
          );

          return {
            id,
            username,
            senderId,
            status: req.status || "pending",
          };
        });

        return mappedRequests;
      }

      // If we get here, the response format was unexpected
      console.warn(
        "Unexpected response format for pending requests:",
        response
      );
      return [];
    } catch (error) {
      console.error("Error fetching pending friend requests:", error);
      throw error;
    }
  }

  // Send a friend request
  async sendFriendRequest(username: string): Promise<any> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      return await httpService.post("/friends", token, { username });
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  }

  // Accept a friend request
  async acceptFriendRequest(username: string): Promise<any> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(`Accepting friend request from username: ${username}`);

      // Make sure we're sending the exact format the backend expects
      const requestData = { username: username };
      console.log("Request data:", requestData);

      const response = await httpService.post(
        "/friends/accept",
        token,
        requestData
      );
      console.log("Friend request accepted response:", response);

      return response;
    } catch (error: any) {
      console.error("Error accepting friend request:", error);

      // Add more detailed logging to diagnose the issue
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      throw error;
    }
  }

  // Reject a friend request
  async rejectFriendRequest(username: string): Promise<any> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      return await httpService.post("/friends/reject", token, { username });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw error;
    }
  }
}

export default new FriendsService();
