import httpHelper from "../utils/HttpHelper";
import * as SecureStore from "expo-secure-store";

// Token key constant
const TOKEN_KEY = "my-jwt";

// Define types
export interface GameInvite {
  id: string;
  senderUsername: string;
  senderId: string;
  stake: number;
  mode: "Strokeplay" | "Matchplay" | "Skin" | "Wolf";
  course: string;
  name: string;
  createdAt: string;
  status: "Pending" | "Accepted" | "Rejected";
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

  // Send game invites to multiple users
  async sendGameInvites(
    receiverUsernames: string[],
    stake: number,
    mode: "Strokeplay" | "Matchplay" | "Skin" | "Wolf",
    name: string,
    course: string
  ): Promise<any> {
    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error("Authentication token not found");
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

      // Map the response to our GameInvite type format
      if (Array.isArray(response)) {
        return response.map((invite) => ({
          id: invite._id || invite.id,
          senderUsername: invite.senderUsername || "Unknown",
          senderId: invite.senderId || invite.sender,
          stake: invite.stake || 0,
          mode: invite.mode || "Strokeplay",
          course: invite.course || "Unknown Course",
          name: invite.name || "Game",
          createdAt: invite.createdAt || new Date().toISOString(),
          status: invite.status || "Pending",
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching pending game invites:", error);
      throw error;
    }
  }

  // Accept a game invite
  async acceptGameInvite(username: string): Promise<any> {
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
}

export default new GameService();
