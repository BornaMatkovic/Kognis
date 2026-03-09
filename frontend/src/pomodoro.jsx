import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";
import "./pomodoro.css";

function Pomodoro() {
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [maxTime, setMaxTime] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startP = () => {
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
        setIsRunning(false);
    };

    const startS = () => {
        setTimeLeft(5 * 60);
        setMaxTime(5 * 60);
        setIsRunning(false);
    };

    const startL = () => {
        setTimeLeft(20 * 60);
        setMaxTime(20 * 60);
        setIsRunning(false);
    };

    const startTimer = () => {
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
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

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
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
