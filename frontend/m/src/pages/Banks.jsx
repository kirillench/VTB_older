import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getBanks, connectBank } from '../api/banks';

const Banks = () => {
    const { currentUser } = useAuth();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const data = await getBanks();
                setBanks(data);
            } catch (err) {
                setError('Не удалось загрузить список банков');
            } finally {
                setLoading(false);
            }
        };

        fetchBanks();
    }, []);

    const handleConnect = async (bankSlug) => {
        try {
            const response = await connectBank(bankSlug);
            if (response.auth_url) {
                window.location.href = response.auth_url;
            }
        } catch (err) {
            setError('Ошибка подключения банка');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Подключенные банки</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks.map((bank) => (
                    <div
                        key={bank.slug}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-xl font-semibold mb-4">{bank.name}</h3>
                        <button
                            onClick={() => handleConnect(bank.slug)}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Подключить
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Banks;

