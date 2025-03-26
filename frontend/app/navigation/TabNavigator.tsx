import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import TabHomeScreen from "../tabs/TabHomeScreen";
import FriendsScreen from "../tabs/FriendsScreen";
import PlayScreen from "../tabs/PlayScreen";
import HistoryScreen from "../tabs/HistoryScreen";
import ProfileScreen from "../tabs/ProfileScreen";

const Tab = createBottomTabNavigator();

// Define a type for Ionicons names
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabConfig: Array<{
  name: string;
  component: React.ComponentType<any>;
  focusedIcon: IoniconName;
  unfocusedIcon: IoniconName;
}> = [
  {
    name: "TabHome",
    component: TabHomeScreen,
    focusedIcon: "home",
    unfocusedIcon: "home-outline",
  },
  {
    name: "Friends",
    component: FriendsScreen,
    focusedIcon: "people",
    unfocusedIcon: "people-outline",
  },
  {
    name: "History",
    component: HistoryScreen,
    focusedIcon: "time",
    unfocusedIcon: "time-outline",
  },
  {
    name: "Play",
    component: PlayScreen,
    focusedIcon: "play-circle",
    unfocusedIcon: "play-circle-outline",
  },
  {
    name: "Profile",
    component: ProfileScreen,
    focusedIcon: "person",
    unfocusedIcon: "person-outline",
  },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#434371" },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      }}
    >
      {tabConfig.map(({ name, component, focusedIcon, unfocusedIcon }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? focusedIcon : unfocusedIcon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
