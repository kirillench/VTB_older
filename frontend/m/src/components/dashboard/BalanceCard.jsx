import React from 'react';

const BalanceCard = ({ totalBalance, predictedBalance, accounts }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Общий баланс</h2>
            <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(totalBalance || 0)}
                </p>
            </div>
            {predictedBalance && predictedBalance !== totalBalance && (
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Прогнозируемый баланс</p>
                    <p className="text-xl font-semibold text-gray-700">
                        {formatCurrency(predictedBalance)}
                    </p>
                </div>
            )}
            {accounts && accounts.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Счета</h3>
                    <div className="space-y-2">
                        {accounts.map((account) => (
                            <div key={account.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <div>
                                    <p className="text-sm font-medium">{account.mask || account.accountId}</p>
                                    <p className="text-xs text-gray-500">{account.currency || 'RUB'}</p>
                                </div>
                                <p className="text-sm font-semibold">
                                    {formatCurrency(account.balance || 0)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceCard;

