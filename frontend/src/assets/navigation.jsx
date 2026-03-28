import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./navigation.css";


function Navigation() {
    const [active, setActive] = useState(false);
    const navigate = useNavigate();

    return (
        <div className={`navSystem ${active ? "active" : ""}`}>
            <div
                className="toggle"
                onClick={() => setActive(!active)} // <-- promjena
            >
                <ion-icon name="add-outline"></ion-icon>
            </div>

            <ul>
                <li style={{ "--i": 0 }}>
                    <a onClick={() => navigate("/pomodoro")} style={{ cursor: "pointer" }}><ion-icon name="timer-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 1 }}>
                    <a onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}><ion-icon name="person-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 2 }}>
                    <a onClick={() => navigate("/quiz")} style={{ cursor: "pointer" }}><ion-icon name="help-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 3 }}>
                    <a href="#"><ion-icon name="videocam-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 4 }}>
                    <a href="#"><ion-icon name="stats-chart-outline"></ion-icon></a>
                </li>
            </ul>
        </div>
    );
}

export default Navigation;