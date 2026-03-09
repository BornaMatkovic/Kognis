import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username: identifier,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem("user");
                sessionStorage.setItem("user", JSON.stringify(data));
                navigate("/home");
            } else {
                setError(data.detail || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check if the backend is running.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="LoginCard">
                <h1>LOGIN</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username or email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
                    <span className="registerJump"
                        onClick={() => navigate("/register")}
                        style={{ cursor: "pointer", color: "blue" }}
                    >
                        register
                    </span>
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </>
    );
}

export default Login;