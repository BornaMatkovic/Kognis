import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import Home from "./home.jsx";

function isAuthenticated() {
    try {
        const user = sessionStorage.getItem("user");
        if (!user) {
            return false;
        }

        const parsed = JSON.parse(user);
        return Boolean(parsed?.id);
    } catch {
        return false;
    }
}

function ProtectedRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
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
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;