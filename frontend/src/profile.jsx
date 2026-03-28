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
        return <div>Loading...</div>;
    }

    if (!userData) {
        return null;
    }

    return (
        <>
            <div className="ProfileCard">
                <h1>PROFILE</h1>
                <p className="usernameP">Username: {userData.username}</p>
                <p className="emailP">Email: {userData.email}</p>
                <p className="scoreP">Score: {userData.score}</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <Navigation />
        </>

    );
}

export default Profile;