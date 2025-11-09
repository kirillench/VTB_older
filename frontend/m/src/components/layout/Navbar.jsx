import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            MultiBank
                        </Link>
                        {currentUser && (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                                    Дашборд
                                </Link>
                                <Link to="/banks" className="text-gray-700 hover:text-blue-600">
                                    Банки
                                </Link>
                                <Link to="/premium" className="text-gray-700 hover:text-blue-600">
                                    Premium
                                </Link>
                                <Link to="/settings" className="text-gray-700 hover:text-blue-600">
                                    Настройки
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <span className="text-gray-700">{currentUser.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    Вход
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

