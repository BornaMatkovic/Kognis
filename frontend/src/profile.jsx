import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";
import "./profile.css";

function Profile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/me/", {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        const { authenticated, ...user } = data;
                        setUserData(user);
                        sessionStorage.setItem("user", JSON.stringify(user));
                    } else {
                        navigate("/login", { replace: true });
                    }
                } else {
                    navigate("/login", { replace: true });
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    if (loading) {
        return <div className="profile-loading">Loading...</div>;
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <div className="ProfileCard">
                <div className="profile-header">
                    <div className="profile-avatar">{userData.username[0].toUpperCase()}</div>
                    <span className="profile-username">{userData.username}</span>
                </div>
                <div className="profile-body">
                    <div className="stat-row">
                        <span className="stat-label">Email</span>
                        <span className="stat-value">{userData.email}</span>
                    </div>
                    <div className="stat-row score-row">
                        <span className="stat-label">Score</span>
                        <span className="stat-value">{userData.score}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Profile;
