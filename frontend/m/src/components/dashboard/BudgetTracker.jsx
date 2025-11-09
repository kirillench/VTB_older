import React from 'react';

const BudgetTracker = ({ budgets }) => {
    const getProgressColor = (percent) => {
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (!budgets || budgets.length === 0) {
        return (
            <div className="text-gray-500 text-center py-4">
                Нет активных бюджетов
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {budgets.map((budget, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">{budget.category}</h3>
                        <span className="text-sm text-gray-600">
                            {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.limit || 0)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                            className={`h-2.5 rounded-full ${getProgressColor(budget.percent || 0)}`}
                            style={{ width: `${Math.min(budget.percent || 0, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{budget.percent || 0}% использовано</span>
                        <span>
                            Осталось: {formatCurrency(Math.max(0, (budget.limit || 0) - (budget.spent || 0)))}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetTracker;

