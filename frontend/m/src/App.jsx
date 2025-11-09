import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard.jsx';
import Banks from './pages/Banks';
import Premium from './pages/Premium';
import Settings from './pages/Settings';
import './index.css';

function PrivateRoute({ children }) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/banks"
                                element={
                                    <PrivateRoute>
                                        <Banks />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/premium"
                                element={
                                    <PrivateRoute>
                                        <Premium />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <PrivateRoute>
                                        <Settings />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;