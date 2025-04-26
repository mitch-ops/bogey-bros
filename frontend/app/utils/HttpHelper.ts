import axios from "axios";
import { Platform } from "react-native";

export const API_URL = "https://bogey-bros.onrender.com/api";
// export const API_URL = "http://localhost:3000/api";
// export const API_URL =
//   Platform.OS === "android"
//     ? "http://10.0.2.2:3000/api"
//     : "http://127.0.0.1:3000/api";

class HttpHelper {
  private baseUrl: string = API_URL;

  // Helper for GET requests
  async get(endpoint: string, token: string | null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`GET request failed for ${endpoint}:`, error);
      if (error.response) {
        throw new Error(
          `HTTP error: ${error.response.status} - 
            ${JSON.stringify(error.response)}
          }`
        );
      } else {
        throw new Error("API Request Failed");
      }
    }
  }

  // Helper for POST requests
  async post(endpoint: string, token: string | null, data: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`POST request failed for ${endpoint}:`, error);
      if (error.response) {
        throw new Error(
          `HTTP error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else {
        throw new Error("API Request Failed");
      }
    }
  }

  // Helper for PUT requests
  async put(endpoint: string, token: string | null, data: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios.put(url, data, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`PUT request failed for ${endpoint}:`, error);
      if (error.response) {
        throw new Error(
          `HTTP error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else {
        throw new Error("API Request Failed");
      }
    }
  }

  // Helper for DELETE requests
  async delete(endpoint: string, token: string | null, data: any = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await axios.delete(url, {
        headers,
        data: data, // For DELETE requests, axios requires data to be passed this way
      });
      return response.data;
    } catch (error: any) {
      console.error(`DELETE request failed for ${endpoint}:`, error);
      if (error.response) {
        throw new Error(
          `HTTP error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else {
        throw new Error("API Request Failed");
      }
    }
  }
}

export default new HttpHelper();
