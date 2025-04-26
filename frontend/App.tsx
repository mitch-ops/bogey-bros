import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./app/screens/Login";
import { AuthProvider, useAuth } from "./app/context/AuthContext"; // For authentication
import Test from "./app/screens/TestScreen";
import "./global.css"; // Needed for tailwind
import { Button } from "react-native";
import TabNavigator from "./app/navigation/TabNavigator";

// Define the type for our navigator
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
};

// const Stack = createStackNavigator<RootStackParamList>();
const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <Layout></Layout>
    </AuthProvider>
  );
}

export const Layout = () => {
  const { authState, onLogout } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState?.authenticated ? (
          <Stack.Screen
            name="Bogey Bros"
            component={TabNavigator}
            options={{
              headerRight: () => <Button onPress={onLogout} title="Sign Out" />,
            }}
          ></Stack.Screen>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false, // This will hide the header on the Login screen
            }}
          ></Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
