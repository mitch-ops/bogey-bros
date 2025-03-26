import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Button } from "react-native";

import { AuthProvider, useAuth } from "./app/context/AuthContext";
import Login from "./app/screens/Login";
import EditProfile from "./app/screens/EditProfile";
import TabNavigator from "./app/navigation/TabNavigator";

import "./global.css";

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

const Layout = () => {
  const { authState, onLogout } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
  {authState?.authenticated ? (
    <>
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          headerShown: true,
          headerRight: () => (
            <Button onPress={onLogout} title="Sign Out" />
          ),
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ title: "Edit Profile" }}
      />
    </>
  ) : (
    <Stack.Screen
      name="Login"
      component={Login}
      options={{ headerShown: false }}
    />
  )}
</Stack.Navigator>
    </NavigationContainer>
  );
};
