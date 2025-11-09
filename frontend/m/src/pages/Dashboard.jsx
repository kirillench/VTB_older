import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getFinancialSummary, getTransactions, getSpendingAnalytics } from '../api/dashboard';
import BalanceCard from '../components/dashboard/BalanceCard';
import TransactionList from '../components/dashboard/TransactionList';
import SpendingChart from '../components/dashboard/SpendingChart';
import BudgetTracker from '../components/dashboard/BudgetTracker';
import { LineChart } from '../utils/charts';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                setLoading(true);
                setError(null);

                // Получаем данные в параллели для оптимизации
                const [summaryData, transactionsData, analyticsData] = await Promise.all([
                    getFinancialSummary(),
                    getTransactions({ limit: 10 }),
                    getSpendingAnalytics()
                ]);

                setSummary(summaryData);
                setTransactions(transactionsData.transactions || []);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Автообновление данных каждые 5 минут
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Дашборд</h1>

            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <BalanceCard
                            totalBalance={summary.totalBalance}
                            predictedBalance={summary.predictedBalance}
                            accounts={summary.accounts}
                        />

                        {summary.categorySpending && Object.keys(summary.categorySpending).length > 0 && (
                            <SpendingChart
                                data={summary.categorySpending}
                                title="Расходы по категориям"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Последние транзакции</h2>
                            {transactions.length > 0 ? (
                                <TransactionList transactions={transactions} />
                            ) : (
                                <p className="text-gray-500 text-center py-4">Нет транзакций за последнее время</p>
                            )}
                        </div>

                        {analytics && analytics.monthlyTrends && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Аналитика расходов</h2>
                                <LineChart
                                    data={analytics.monthlyTrends}
                                    title="Динамика расходов за месяц"
                                    yAxisLabel="Сумма (₽)"
                                />
                            </div>
                        )}
                    </div>

                    {summary.budgetStatus && summary.budgetStatus.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Бюджеты</h2>
                            <BudgetTracker budgets={summary.budgetStatus} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;