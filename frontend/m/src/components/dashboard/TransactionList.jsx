import React from 'react';

const TransactionList = ({ transactions }) => {
    const formatCurrency = (amount, currency = 'RUB') => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Продукты': 'bg-green-100 text-green-800',
            'Транспорт': 'bg-blue-100 text-blue-800',
            'Развлечения': 'bg-purple-100 text-purple-800',
            'Здоровье': 'bg-red-100 text-red-800',
            'Другое': 'bg-gray-100 text-gray-800',
        };
        return colors[category] || colors['Другое'];
    };

    return (
        <div className="space-y-2">
            {transactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 border-b border-gray-200 hover:bg-gray-50"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {transaction.category && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                                    {transaction.category}
                                </span>
                            )}
                            {transaction.merchant && (
                                <span className="text-sm font-medium">{transaction.merchant}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            {formatDate(transaction.timestamp)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.amount < 0 ? '-' : '+'}
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionList;

