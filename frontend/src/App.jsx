import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import Home from "./home.jsx";
import Pomodoro from "./pomodoro.jsx";
import Profile from "./profile.jsx";
import Quiz from "./quiz.jsx";
import Statistics from "./statistics.jsx";
import Videos from "./videos.jsx";

function ProtectedRoute({ children, isLoading, isAuthenticated }) {
    if (isLoading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/me/", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        const { authenticated, ...user } = data;
                        sessionStorage.setItem("user", JSON.stringify(user));
                        setIsAuthenticated(true);
                    } else {
                        sessionStorage.removeItem("user");
                        setIsAuthenticated(false);
                    }
                } else {
                    sessionStorage.removeItem("user");
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Auth check error:", err);
                sessionStorage.removeItem("user");
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoading ? (
                            <div>Loading...</div>
                        ) : isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pomodoro"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Pomodoro />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/quiz"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Quiz />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/statistics"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Statistics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/videos"
                    element={
                        <ProtectedRoute isLoading={isLoading} isAuthenticated={isAuthenticated}>
                            <Videos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={
                        isLoading ? (
                            <div>Loading...</div>
                        ) : isAuthenticated ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;