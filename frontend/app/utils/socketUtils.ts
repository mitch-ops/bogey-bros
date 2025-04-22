import { Platform } from "react-native";
import { io } from "socket.io-client";

// Socket instance that can be shared across the app
let socketInstance = null;
// export const API_URL = "https://bogey-bros.onrender.com";
export const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://127.0.0.1:3000";

// Create socket connection
export const createSocketForUser = () => {
  return new Promise((resolve, reject) => {
    // Create a new socket connection if one doesn't exist
    if (!socketInstance) {
      socketInstance = io(API_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected with id:", socketInstance.id);
        resolve(socketInstance.id);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        reject(err);
      });
    } else if (socketInstance.connected) {
      // Socket already exists and is connected
      console.log("Reusing existing socket connection:", socketInstance.id);
      resolve(socketInstance.id);
    } else {
      // Socket exists but isn't connected
      socketInstance.connect();

      socketInstance.once("connect", () => {
        console.log("Socket reconnected with id:", socketInstance.id);
        resolve(socketInstance.id);
      });

      socketInstance.once("connect_error", (err) => {
        console.error("Socket reconnection error:", err);
        reject(err);
      });
    }
  });
};

// Get the socket instance
export const getSocket = () => socketInstance;

// Disconnect the socket
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
