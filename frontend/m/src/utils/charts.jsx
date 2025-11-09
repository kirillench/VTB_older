import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';

export const BarChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
    const chartData = Array.isArray(data) ? data : Object.entries(data || {}).map(([name, value]) => ({
        name,
        value: Math.round(value),
    }));

    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="text-gray-500 text-center py-8">Нет данных для отображения</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const LineChart = ({ data, title, yAxisLabel }) => {
    const chartData = Array.isArray(data) ? data : [];

    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="text-gray-500 text-center py-8">Нет данных для отображения</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="spending" stroke="#8884d8" strokeWidth={2} />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

