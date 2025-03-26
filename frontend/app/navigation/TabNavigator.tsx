import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import TabHomeScreen from "../tabs/TabHomeScreen";
import FriendsScreen from "../tabs/FriendsScreen";
import PlayScreen from "../tabs/PlayScreen";
import HistoryScreen from "../tabs/HistoryScreen";
import ProfileScreen from "../tabs/ProfileScreen";
import LiveGameScreen from "../screens/LiveGameScreen";

// Define the type for the Play stack params
export type PlayStackParamList = {
  PlayMain: undefined;
  LiveGame: {
    gameMode: string;
    stake: number;
    course: string;
    betEnabled: boolean;
    players: {
      id: string;
      username: string;
      avatar: string;
      handicap: number;
    }[];
    game: any;
    gameName: string;
  };
};

// Create a stack navigator for the Play tab
const PlayStack = createStackNavigator<PlayStackParamList>();

// PlayStack component that includes both Play screen and LiveGame screen
function PlayStackNavigator() {
  return (
    <PlayStack.Navigator screenOptions={{ headerShown: false }}>
      <PlayStack.Screen name="PlayMain" component={PlayScreen} />
      <PlayStack.Screen
        name="LiveGame"
        component={LiveGameScreen}
        options={{
          gestureEnabled: false, // Prevent accidental back gestures during game
        }}
      />
    </PlayStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#434371" },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#c5c5dd",
      }}
    >
      <Tab.Screen
        name="TabHome"
        component={TabHomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Play"
        component={PlayStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="golf" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
