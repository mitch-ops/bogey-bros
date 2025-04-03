import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null};
    onRegister?: (username: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
export const API_URL = 'https://bogey-bros.onrender.com/api';
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}: any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token: null,
        authenticated: null
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log(" stored:", token);
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const decoded: { exp: number } = jwtDecode(token); // Decode the token
                const currentTime = Date.now() / 1000;

                if (decoded.exp > currentTime) {
                    setAuthState({
                        token: token,
                        authenticated: true
                    });
                }
                else {
                    console.log("attempting logout");
                    //Handle token expired
                    await logout();
                    console.log("logout successful");
                }
            }
        }
        loadToken();
    }, [])

    const ValidateSession = async () => {
        console.log("Entered checking token");
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                const decoded: { exp: number } = jwtDecode(token); // Decode the token
                const currentTime = Date.now() / 1000;
                console.log("Expires at", decoded.exp);
                console.log("Currently at", currentTime);
                if(decoded.exp < currentTime) {
                    await logout();
                }
            } 
            else {
                await logout();
            }
        } catch (error) {
            await logout();
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            return await axios.post(`${API_URL}/register`, { username, email, password});
        } catch (e) {
            return { error: true, msg: (e as any).response.data.message};
        }
    };

    const login = async (email: string, password: string) => {
        try {
            console.log(`${email} ${password}`)
            const result = await axios.post(`${API_URL}/login`, { email, password});

            console.log(" file: AuthContext.tsx:59 ~ login ~ result:", result)
            setAuthState({
                token: result.data.token,
                authenticated: true
            });

            axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;

            await SecureStore.setItemAsync(TOKEN_KEY, result.data.token);

            return result;

        } catch (e) {
            return { error: true, msg: (e as any).response.data.message};
        }
    };

    const logout = async () => {
        // Delete token from storage
        await SecureStore.deleteItemAsync(TOKEN_KEY);

        //update HTTP headers
        axios.defaults.headers.common['Authorization'] = '';

        // reset auth state
        setAuthState({
            token: null,
            authenticated: false
        });

    };

    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        authState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}