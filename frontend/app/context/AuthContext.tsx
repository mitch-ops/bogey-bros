import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

interface AuthProps {
    authState?: { token: string | null; authenticated: boolean | null};
    onRegister?: (username: string, email: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
    refreshAuthToken?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
const REFRESH_KEY = 'my-jwt-refresh';
export const API_URL = 'https://bogey-bros.onrender.com/api';
// export const API_URL = 'http://localhost:3000/api';
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
            refresh();
        }
        loadToken();
    }, [])

    const refresh = async () => {

        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (token) {
            const decodedToken: { exp: number } = jwtDecode(token); // Decode the token
            const currentTime = Date.now() / 1000;

            //Token is fine no refresh necessary
            if (decodedToken.exp > currentTime) {
                // console.log("Default token wasn't expired");
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthState({
                    token: token,
                    authenticated: true
                });

                return;
            }

            //Begin refreshing

            const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
            // Refresh if we have a refresh token
            if(refreshToken) {
                const decodedRefreshToken: { exp: number } = jwtDecode(refreshToken);
                const currentTime = Date.now() / 1000;

                // Sanity check
                // console.log("refresh not null");
                // console.log("Refresh time limit: ", decodedRefreshToken.exp)
                // console.log("Current time: ", currentTime);

                //Refresh token isn't expired
                if (decodedRefreshToken.exp > currentTime) {
                    try {
                        // console.log("refresh not expired");
                        // Try getting a new access token
                        const result = await axios.post(`${API_URL}/refresh`, {refreshToken});

                        // console.log("Obtained new token: ", result.data.accessToken);
                        // Store access token 
                        await SecureStore.setItemAsync(TOKEN_KEY, result.data.accessToken);

                        // Set authorization header
                        axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.accessToken}`;

                        // set authorization state
                        setAuthState({
                            token: result.data.accessToken,
                            authenticated: true
                        });
                        return result;
                    }
                    catch (e) {
                        console.log("Error occured while refresh", e);
                    }
                }
            }
        }
        logout();   
    }

    const register = async (username: string, email: string, password: string) => {
        try {
            console.log("Awaiting register...");
            return await axios.post(`${API_URL}/register`, { username, email, password});
        } catch (e) {
            return { error: true, msg: (e as any).response.data.message};
        }
    };

    const login = async (email: string, password: string) => {
        try {
            console.log(`${email} ${password}`)
            const result = await axios.post(`${API_URL}/login`, { email, password});

            //console.log(" file: AuthContext.tsx:59 ~ login ~ result:", result)
            setAuthState({
                token: result.data.accessToken,
                authenticated: true
            });
            
            // console.log("\n\n\n\nRefresh token: ", result.data.refreshToken)
            axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.accessToken}`;
            
            // console.log("Token_key value: ", TOKEN_KEY);
            // console.log("Token for storing", result.data.accessToken);
            // console.log("\n\n\n\n", result);
            // console.log("Refresh_key Value value: ", REFRESH_KEY);
            // console.log("Token for storing", result.data.refreshToken);
            let storeResult = await SecureStore.setItemAsync(TOKEN_KEY, result.data.accessToken);

            // console.log("Stored token", storeResult);

            storeResult = await SecureStore.setItemAsync(REFRESH_KEY, result.data.refreshToken)

            // console.log("Stored refresh", storeResult);


            return result;

        } catch (e) {
            // console.log("\n\n\n\nError message: ", e);
            return { error: true, msg: (e as any).response.data.message};
        }
    };

    const logout = async () => {
        console.log("Logout is being called");
        // Delete tokens from storage
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);

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
        refreshAuthToken: refresh,
        authState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}