import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
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

export const getBanks = async () => {
    const response = await axios.get(`${API_URL}/banks`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const connectBank = async (bankSlug) => {
    const response = await axios.post(`${API_URL}/connect/${bankSlug}`, {}, {
        headers: {
            ...getAuthHeader(),
            'X-Demo-User': '1', // DEMO: передаем user id в header
        },
    });
    return response.data;
};

export const disconnectBank = async (bankId) => {
    const response = await axios.delete(`${API_URL}/banks/${bankId}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const refreshBankData = async (bankId) => {
    const response = await axios.post(`${API_URL}/banks/${bankId}/refresh`, {}, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const createPayment = async (paymentData) => {
    const response = await axios.post(`${API_URL}/payments/transfer`, paymentData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Специальная функция для связи с OpenBanking API напрямую для OAuth
export const initiateBankOAuth = async (bankName) => {
    // Имитируем процесс OAuth для демонстрации
    const mockAuthUrl = process.env.REACT_APP_API_URL.replace('/api', '') + `/oauth/${bankName}`;

    // В реальном приложении здесь будет запрос к нашему бэкенду для генерации auth URL
    return {
        authUrl: mockAuthUrl,
        state: Math.random().toString(36).substring(2, 15)
    };
};