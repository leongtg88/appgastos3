import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    const login = async (username: string, password: string) => {
        const response = await api.login(username, password);
        if (response.success && response.token) {
            setToken(response.token);
            await AsyncStorage.setItem('token', response.token);
        } else {
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        setToken(null);
        await AsyncStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
