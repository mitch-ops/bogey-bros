import httpHelper from "../utils/HttpHelper";
import * as SecureStore from "expo-secure-store";

// Token key constant
const TOKEN_KEY = "my-jwt";

// Define types
export interface GameInvite {
  _id: string;
  id?: string;
  senderId: {
    _id: string;
    username: string;
  };
  receiverId: string;
  stake: number;
  mode: "Strokeplay" | "Matchplay";
  name: string;
  course: string;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  handicap: number;
}

export interface Game {
  _id: string;
  gameName: string;
  courseName: string;
  startTime: string;
  status: "In-Progress" | "Completed";
  mode: "Strokeplay" | "Matchplay";
  pot: number;
  participants: string[];
  scores: number[][];
  totals: number[][];
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  username: string;
  handicap?: number;
  avatar?: string;
}

class GameService {
  // Get the token from secure storage
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token from secure storage:", error);
      return null;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(`Fetching user info for ID: ${userId}`);
      const response = await httpHelper.get(`/userById/${userId}`, token);
      console.log("User data:", response);

      return response;
    } catch (error) {
      console.error(`Error fetching user ID ${userId}:`, error);
      throw error;
    }
  }

  // Convert user IDs to usernames
  async getUsernamesByIds(userIds: string[]): Promise<string[]> {
    try {
      // Get usernames for all user IDs
      const userPromises = userIds.map((id) => this.getUserById(id));
      const users = await Promise.all(userPromises);

      // Extract usernames
      const usernames = users.map((user) => user.username);
      console.log("Converted IDs to usernames:", usernames);

      return usernames;
    } catch (error) {
      console.error("Error converting user IDs to usernames:", error);
      throw error;
    }
  }

  // Send game invites to multiple users
  async sendGameInvites(
    receiverUserIds: string[],
    stake: number,
    mode: "Strokeplay" | "Matchplay",
    name: string,
    course: string
  ): Promise<{ invites: GameInvite[]; savedGame: Game }> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(
        `Converting ${receiverUserIds.length} user IDs to usernames...`
      );

      // If there are no receivers (solo play), use an empty array
      let receiverUsernames: string[] = [];
      if (receiverUserIds.length > 0) {
        receiverUsernames = await this.getUsernamesByIds(receiverUserIds);
      }

      console.log(`Sending game invites to: ${receiverUsernames.join(", ")}`);
      console.log(`Game details: ${mode}, $${stake}, ${course}`);

      // Make API call to send invites
      const response = await httpHelper.post("/invite", token, {
        receiverUsernames,
        stake,
        mode,
        name,
        course,
      });

      console.log("Game invite response:", response);
      return response;
    } catch (error) {
      console.error("Error sending game invites:", error);
      throw error;
    }
  }

  // Get pending game invites for the current user
  async getPendingGameInvites(): Promise<GameInvite[]> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Fetching pending game invites...");
      const response = await httpHelper.get("/invite", token);
      console.log("Pending game invites response:", response);

      // Return the response directly, assuming it's already an array of GameInvite objects
      return response || [];
    } catch (error) {
      console.error("Error fetching pending game invites:", error);
      throw error;
    }
  }

  // Accept a game invite
  async acceptGameInvite(
    username: string
  ): Promise<{ invite: GameInvite; game: Game }> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(`Accepting game invite from: ${username}`);
      const response = await httpHelper.post("/invite/accept", token, {
        username,
      });
      console.log("Accept game invite response:", response);

      return response;
    } catch (error) {
      console.error("Error accepting game invite:", error);
      throw error;
    }
  }

  // Reject a game invite
  async rejectGameInvite(username: string): Promise<any> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(`Rejecting game invite from: ${username}`);
      const response = await httpHelper.post("/invite/reject", token, {
        username,
      });
      console.log("Reject game invite response:", response);

      return response;
    } catch (error) {
      console.error("Error rejecting game invite:", error);
      throw error;
    }
  }

  // Update a game's scores
  // Not tested yet
  async updateGameScores(
    gameName: string,
    scores: number[][],
    totals: number[][]
  ): Promise<Game> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(`Updating scores for game: ${gameName}`);

      const response = await httpHelper.put("/games/update", token, {
        gameName,
        scores,
        totals,
      });

      console.log("Game update response:", response);
      return response;
    } catch (error) {
      console.error(`Error updating game scores for ${gameName}:`, error);
      throw error;
    }
  }
}

export default new GameService();
