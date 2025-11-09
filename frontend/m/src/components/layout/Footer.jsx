import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">MultiBank</h3>
                        <p className="text-gray-400">
                            Мультибанковский финансовый агрегатор для управления вашими финансами.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Навигация</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/dashboard" className="hover:text-white">Дашборд</a></li>
                            <li><a href="/banks" className="hover:text-white">Банки</a></li>
                            <li><a href="/premium" className="hover:text-white">Premium</a></li>
                            <li><a href="/settings" className="hover:text-white">Настройки</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Контакты</h3>
                        <p className="text-gray-400">
                            Поддержка: support@multibank.ru
                        </p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 MultiBank. Все права защищены.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

