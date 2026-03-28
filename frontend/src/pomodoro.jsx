import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";
import "./pomodoro.css";

function Pomodoro() {
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [maxTime, setMaxTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [lastMinute, setLastMinute] = useState(25);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const updateUserStats = async (field, incrementBy = 1) => {
        try {
            const user = JSON.parse(sessionStorage.getItem("user"));
            if (!user || !user.id) return;

            const currentValue = user[field] || 0;
            const currentScore = user.score || 0;

            let updateData = {
                [field]: currentValue + incrementBy
            };

            // Ako se ažurira timer_minutes, poveća score za 1
            if (field === "timer_minutes") {
                updateData.score = currentScore + 1;
            }

            // Ako se ažurira timer_interrupts, smanji score za 5 (min 0)
            if (field === "timer_interrupts") {
                updateData.score = Math.max(0, currentScore - 5);
            }

            const response = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                sessionStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error(`Error updating ${field}:`, err);
        }
    };

    const startP = () => {
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
        setLastMinute(25);
        setIsRunning(false);
    };

    const startS = () => {
        setTimeLeft(5 * 60);
        setMaxTime(5 * 60);
        setLastMinute(5);
        setIsRunning(false);
    };

    const startL = () => {
        setTimeLeft(20 * 60);
        setMaxTime(20 * 60);
        setLastMinute(20);
        setIsRunning(false);
    };

    const startTimer = () => {
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
        if (isRunning) {
            updateUserStats("timer_interrupts");
        }
    };

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        const currentMinute = Math.floor(timeLeft / 60);
        if (isRunning && currentMinute < lastMinute) {
            updateUserStats("timer_minutes");
            setLastMinute(currentMinute);
        }
    }, [timeLeft, isRunning, lastMinute]);

    const resetTimer = () => {
        if (isRunning) {
            updateUserStats("timer_interrupts");
        }
        setIsRunning(false);
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
        setLastMinute(25);
    };

    const getBackgroundGradient = () => {
        const percentage = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
        const whitePercentage = 100 - percentage;

        return `linear-gradient(to bottom, white 0%, white ${whitePercentage}%, #667eea ${whitePercentage}%, #1b3eda 100%)`;
    };

    return (
        <>
            <div className="pomodoroCard" style={{ background: getBackgroundGradient() }}>
                <div className="headingPomodoro">
                    <h1>POMODORO TIMERS</h1>
                </div>

                <div className="choosePomodoro">
                    <button onClick={startP}>pomodoro</button>
                    <button onClick={startS}>short break</button>
                    <button onClick={startL}>long break</button>
                </div>
                <div className="timer">
                    <h1>{formatTime(timeLeft)}</h1>
                    <button onClick={startTimer} disabled={isRunning}>START</button>
                    <button onClick={stopTimer} disabled={!isRunning}>STOP</button>
                    <button onClick={resetTimer}>RESET</button>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Pomodoro;
