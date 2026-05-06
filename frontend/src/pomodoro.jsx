import React, { useState, useEffect } from "react";
import Navigation from "./assets/navigation.jsx";
import "./pomodoro.css";

const POMODORO_STORAGE_KEY = "pomodoroTimerState";

const getDefaultTimerState = () => ({
    timeLeft: 25 * 60,
    maxTime: 25 * 60,
    isRunning: false,
    lastMinute: 25,
    endAt: null,
});

const loadTimerState = () => {
    try {
        const raw = sessionStorage.getItem(POMODORO_STORAGE_KEY);
        if (!raw) return getDefaultTimerState();

        const parsed = JSON.parse(raw);
        const safeState = {
            ...getDefaultTimerState(),
            ...parsed,
        };

        if (safeState.isRunning && safeState.endAt) {
            const remaining = Math.max(0, Math.ceil((safeState.endAt - Date.now()) / 1000));
            safeState.timeLeft = remaining;
            if (remaining === 0) {
                safeState.isRunning = false;
                safeState.endAt = null;
                safeState.lastMinute = 0;
            }
        }

        return safeState;
    } catch (err) {
        console.error("Error loading pomodoro state:", err);
        return getDefaultTimerState();
    }
};

function Pomodoro() {
    const initialState = loadTimerState();
    const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
    const [maxTime, setMaxTime] = useState(initialState.maxTime);
    const [isRunning, setIsRunning] = useState(initialState.isRunning);
    const [lastMinute, setLastMinute] = useState(initialState.lastMinute);
    const [endAt, setEndAt] = useState(initialState.endAt);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const updateUserStats = async ({ timer_minutes = 0, timer_interrupts = 0, scoreChange = 0 }) => {
        try {
            const user = JSON.parse(sessionStorage.getItem("user"));
            if (!user || !user.id) return;

            const updateData = {
                timer_minutes: (user.timer_minutes || 0) + timer_minutes,
                timer_interrupts: (user.timer_interrupts || 0) + timer_interrupts,
                score: Math.max(0, (user.score || 0) + scoreChange),
            };

            const response = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                sessionStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error("Error updating stats:", err);
        }
    };

    const startP = () => {
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
        setLastMinute(25);
        setIsRunning(false);
        setEndAt(null);
    };

    const startS = () => {
        setTimeLeft(5 * 60);
        setMaxTime(5 * 60);
        setLastMinute(5);
        setIsRunning(false);
        setEndAt(null);
    };

    const startL = () => {
        setTimeLeft(20 * 60);
        setMaxTime(20 * 60);
        setLastMinute(20);
        setIsRunning(false);
        setEndAt(null);
    };

    const startTimer = () => {
        if (timeLeft <= 0) return;
        setIsRunning(true);
        setEndAt(Date.now() + (timeLeft * 1000));
    };

    const stopTimer = () => {
        setIsRunning(false);
        setEndAt(null);
        if (isRunning) {
            updateUserStats({ timer_interrupts: 1, scoreChange: -3 });
        }
    };

    useEffect(() => {
        if (!isRunning || !endAt) return undefined;

        const tick = () => {
            const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                setIsRunning(false);
                setEndAt(null);
                setLastMinute(0);
            }
        };

        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [isRunning, endAt]);

    useEffect(() => {
        const currentMinute = Math.floor(timeLeft / 60);
        if (isRunning && currentMinute < lastMinute) {
            const minutesCompleted = lastMinute - currentMinute;
            updateUserStats({ timer_minutes: minutesCompleted, scoreChange: minutesCompleted });
            setLastMinute(currentMinute);
        }
    }, [timeLeft, isRunning, lastMinute]);

    useEffect(() => {
        try {
            const timerState = {
                timeLeft,
                maxTime,
                isRunning,
                lastMinute,
                endAt,
            };
            sessionStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(timerState));
        } catch (err) {
            console.error("Error saving pomodoro state:", err);
        }
    }, [timeLeft, maxTime, isRunning, lastMinute, endAt]);

    const resetTimer = () => {
        if (timeLeft > 0) {
            updateUserStats({ timer_interrupts: 1, scoreChange: -5 });
        }
        setIsRunning(false);
        setEndAt(null);
        setTimeLeft(25 * 60);
        setMaxTime(25 * 60);
        setLastMinute(25);
    };

    const getBackgroundGradient = () => {
        const percentage = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
        const whitePercentage = 100 - percentage;

        return `linear-gradient(to bottom, #f5f4ff 0%, #f5f4ff ${whitePercentage}%, #6366f1 ${whitePercentage}%, #7c3aed 100%)`;
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
                    <div className="timer-controls">
                        <button onClick={startTimer} disabled={isRunning}>START</button>
                        <button onClick={stopTimer} disabled={!isRunning}>STOP</button>
                        <button onClick={resetTimer}>RESET</button>
                    </div>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Pomodoro;
