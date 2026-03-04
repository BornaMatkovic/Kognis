import React from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";


function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <>
            <div className="LoginCard">
                <h1>HOME</h1>
                <button type="button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <Navigation />
        </>

    );
}

export default Home;
