import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => {
    const user = localStorage.getItem('multibank_user');
    if (user) {
        const userData = JSON.parse(user);
        return {
            'X-User-ID': userData.id || userData.user_id || '1',
        };
    }
    return {};
};

export const getFinancialSummary = async () => {
    const response = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getTransactions = async (params = {}) => {
    const response = await axios.get(`${API_URL}/dashboard/transactions`, {
        headers: getAuthHeader(),
        params: {
            limit: params.limit || 10,
            offset: params.offset || 0,
            startDate: params.startDate,
            endDate: params.endDate,
        },
    });
    return response.data;
};

export const getSpendingAnalytics = async () => {
    const response = await axios.get(`${API_URL}/dashboard/analytics`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getTransactionCategories = async () => {
    const response = await axios.get(`${API_URL}/payments/categories`, {
        headers: getAuthHeader(),
    });
    return response.data;
};