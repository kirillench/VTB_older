import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('multibank_user');
        const tokenExpiry = localStorage.getItem('multibank_token_expiry');

        if (storedUser && tokenExpiry) {
            const user = JSON.parse(storedUser);
            const isTokenExpired = new Date() > new Date(parseInt(tokenExpiry));

            if (!isTokenExpired) {
                setCurrentUser(user);
            }
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await apiLogin(email, password);
        const { user_id, session } = response;

        // Сохраняем данные пользователя
        const user = { id: user_id, email, session };
        setCurrentUser(user);
        localStorage.setItem('multibank_user', JSON.stringify(user));

        // Устанавливаем время истечения сессии (24 часа)
        const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('multibank_token_expiry', expiryTime.toString());

        return response;
    };

    const register = async (email, password) => {
        const response = await apiRegister(email, password);
        // После регистрации автоматически логинимся
        if (response.id) {
            const user = { id: response.id, email: response.email };
            setCurrentUser(user);
            localStorage.setItem('multibank_user', JSON.stringify(user));
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('multibank_token_expiry', expiryTime.toString());
        }
        return response;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('multibank_user');
        localStorage.removeItem('multibank_token_expiry');
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}