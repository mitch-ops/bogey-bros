import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import Golfsvg from "../assets/Golfsvg.svg";
import LoginScreen from "../../components/LoginComponent";
import RegisterScreen from "../../components/RegisterComponent";
import { useAuth } from "../context/AuthContext";
import { createSocketForUser } from "../utils/socketUtils";

const Login = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); //For registation
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Error message above login / register button
  const [registerFields, setRegisterFields] = useState(false); //To alternate between being in register a user or logging in user
  const [isLoading, setIsLoading] = useState(false); //Make sure button isn't pressable while awaiting for server response
  const { onLogin, onRegister, loading } = useAuth(); //Authentication and registration component. Look at ../context/AuthContext for how it works

  // Handles the login
  const login = async () => {
    setIsLoading(true);
    const result = await onLogin!(email, password);
    setIsLoading(false);

    if (result && result.error) {
      alert(result.msg);
    } else {
      console.log("success");
    }

    // Connect socket after successful login
    const socketId = await createSocketForUser();
    console.log("socket connected after login with socke id:", socketId);
  };

  //Handles registration
  const register = async () => {
    // Basic Validation
    console.log("Pressed register");
    // Case where one field is empty
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstname ||
      !lastname
    ) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    // Check that passwords are equal
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Clear error message
    setErrorMessage("");
    setIsLoading(true);
    console.log("loading...");
    const result = await onRegister!(
      username,
      firstname,
      lastname,
      email,
      password
    );
    console.log("register completed");
    setIsLoading(false);
    if (result && result.error) {
      setErrorMessage(result.msg);
    } else {
      console.log("Attempting Login...");
      // Log in after successful registration
      login();
      console.log("Login success");
    }
  };

  const switchToRegister = () => {
    setRegisterFields(true);
  };

  const switchToLogin = () => {
    setRegisterFields(false);
  };

  return (
    <View className="flex-1">
      <Modal animationType="fade" transparent={true} visible={loading}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator
              style={styles.modalActivity}
              size="small"
              color="#434371"
            />
            <Text style={styles.modalText}>Signing in...</Text>
          </View>
        </View>
      </Modal>
      {registerFields ? (
        <RegisterScreen
          firstname={firstname}
          setFirstname={setFirstname}
          lastname={lastname}
          setLastname={setLastname}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          errorMessage={errorMessage}
          isLoading={isLoading}
          handleLogin={switchToLogin}
          handleRegister={register}
        />
      ) : (
        <LoginScreen
          handleLogin={login}
          handleRegister={switchToRegister}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // This dims the background
  },
  modalView: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalActivity: {
    paddingRight: 10,
  },
  modalText: {
    textAlign: "center",
  },
});
export default Login;
