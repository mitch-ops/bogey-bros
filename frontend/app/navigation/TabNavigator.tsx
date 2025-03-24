import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TabHomeScreen from "../tabs/TabHomeScreen";
import FriendsScreen from "../tabs/FriendsScreen";
import PlayScreen from "../tabs/PlayScreen";
import HistoryScreen from "../tabs/HistoryScreen";
import ProfileScreen from "../tabs/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#434371" },
      }}
    >
      <Tab.Screen name="TabHome" component={TabHomeScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
