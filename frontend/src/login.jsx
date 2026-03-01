import React from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    return (
        <div className="LoginCard">
            <h1>LOGIN</h1>
            <form>
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <span className="registerJump"
                    onClick={() => navigate("/register")}
                    style={{ cursor: "pointer", color: "blue" }}
                >
                    register
                </span>
                <button type="submit">Login</button>

            </form>
        </div>
    );
}

export default Login;