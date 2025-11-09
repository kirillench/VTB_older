import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Premium = () => {
    const { currentUser } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Загрузить информацию о подписке
        setLoading(false);
    }, []);

    const plans = [
        {
            name: 'Free',
            price: '0₽',
            features: [
                'До 2 подключенных банков',
                'Базовая аналитика',
                'История транзакций за 30 дней',
                'Ограниченные графики',
            ],
        },
        {
            name: 'Premium',
            price: '299₽/мес',
            features: [
                'Неограниченное количество банков',
                'Расширенная аналитика',
                'Полная история транзакций',
                'Экспорт данных',
                'Персонализированные рекомендации',
                'Приоритетная поддержка',
            ],
        },
        {
            name: 'Business',
            price: '999₽/мес',
            features: [
                'Все функции Premium',
                'API доступ',
                'Многопользовательский доступ',
                'Расширенная отчетность',
                'Интеграция с бухгалтерскими системами',
            ],
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Тарифы и подписки</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-white rounded-lg shadow p-6 ${
                            plan.name === 'Premium' ? 'border-2 border-blue-500' : ''
                        }`}
                    >
                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</p>
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            className={`w-full px-4 py-2 rounded ${
                                plan.name === 'Free'
                                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            disabled={plan.name === 'Free'}
                        >
                            {plan.name === 'Free' ? 'Текущий тариф' : 'Выбрать тариф'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Premium;

