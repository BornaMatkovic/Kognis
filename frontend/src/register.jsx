import React from "react";
import "./register.css";

function Register() {
    return (
        <div className="LoginCard">
            <h1>REGISTER</h1>
            <form>
                <input type="text" placeholder="Username" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button type="submit">Create account</button>
            </form>
        </div>
    );
}

export default Register;
