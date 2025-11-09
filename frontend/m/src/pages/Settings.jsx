import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        // TODO: Реализовать обновление email
        setMessage('Функция обновления email будет доступна в ближайшее время');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Пароли не совпадают');
            return;
        }
        // TODO: Реализовать обновление пароля
        setMessage('Функция обновления пароля будет доступна в ближайшее время');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Настройки</h1>

            {message && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Профиль</h2>
                    <form onSubmit={handleUpdateEmail}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Обновить email
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Безопасность</h2>
                    <form onSubmit={handleUpdatePassword}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Новый пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Подтвердите пароль
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Обновить пароль
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;

