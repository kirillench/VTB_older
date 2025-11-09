import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
    });
    return response.data;
};

export const register = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
    });
    return response.data;
};

export const getAuthHeader = () => {
    const user = localStorage.getItem('multibank_user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            return {
                'X-User-ID': userData.id || userData.user_id || '1',
            };
        } catch (e) {
            return {};
        }
    }
    return {};
};

