import React, { useState } from "react";
import "./navigation.css";

function Navigation() {
    const [active, setActive] = useState(false); // <-- dodano

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
                    <a href="#"><ion-icon name="timer-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 1 }}>
                    <a href="#"><ion-icon name="person-outline"></ion-icon></a>
                </li>
                <li style={{ "--i": 2 }}>
                    <a href="#"><ion-icon name="help-outline"></ion-icon></a>
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