import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
} from "react-native";
import React, { useState } from 'react';
import Golfsvg from "../assets/Golfsvg.svg"
import LoginScreen from "../../components/LoginComponent"
import RegisterScreen from "../../components/RegisterComponent"
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(""); //For registation
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // Error message above login / register button
    const [registerFields, setRegisterFields] = useState(false); //To alternate between being in register a user or logging in user
    const [isLoading, setIsLoading] = useState(false); //Make sure button isn't pressable while awaiting for server response
    const { onLogin, onRegister } = useAuth(); //Authentication and registration component. Look at ../context/AuthContext for how it works

    // Handles the login 
    const login = async () => {
        setIsLoading(true);
        const result = await onLogin!(username, password);
        setIsLoading(false);

        if (result && result.error) {
            console.log("Something went wrong with the login process")
            alert(result.msg);
        }
        else {
            console.log("success");
        }
    };

    //Handles registration
    const register = async () => {
        // Basic Validation

        // Case where one field is empty
        if (!username || !email || !password || !confirmPassword) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        // Check that passwords are equal
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        // Clear error message
        setErrorMessage('');
        setIsLoading(true);
        const result = await onRegister!(username, email, password);
        setIsLoading(false);
        if (result && result.error) {
            setErrorMessage(result.msg);
        } else {
            console.log("Register successful attempting login...")
            // Log in after successful registration
            login();
        }
    };

    const switchToRegister = () => {
        console.log("2");
        setRegisterFields(true);
    }

    const switchToLogin = () => {
        console.log("1");
        setRegisterFields(false);
    }

    return (
        <View className="flex-1">
            {registerFields ? 
            (
                <RegisterScreen
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
            )
            :
            (   
                <LoginScreen 
                    handleLogin={login} 
                    handleRegister={switchToRegister} 
                    username={username} 
                    setUsername={setUsername} 
                    password={password}
                    setPassword={setPassword}
                    isLoading={isLoading}
                /> 
            )
        
        }
        </View>   
    );
}

export default Login;