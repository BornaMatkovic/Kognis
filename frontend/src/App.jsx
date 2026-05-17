import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import Home from "./home.jsx";
import Pomodoro from "./pomodoro.jsx";
import Profile from "./profile.jsx";
import Quiz from "./quiz.jsx";
import Statistics from "./statistics.jsx";
import Videos from "./videos.jsx";

function ZasticenaRuta({ children, ucitavam, prijavljen }) {
    if (ucitavam) return <div>Učitavam...</div>;
    return prijavljen ? children : <Navigate to="/login" replace />;
}

function App() {
    const [prijavljen, setPrijavljen] = useState(false);
    const [ucitavam, setUcitavam] = useState(true);

    useEffect(() => {
        const provjeriSesiju = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/me/", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        const { authenticated, ...user } = data;
                        sessionStorage.setItem("user", JSON.stringify(user));
                        setPrijavljen(true);
                    } else {
                        sessionStorage.removeItem("user");
                        setPrijavljen(false);
                    }
                } else {
                    sessionStorage.removeItem("user");
                    setPrijavljen(false);
                }
            } catch (err) {
                console.error("Greška pri provjeri sesije:", err);
                sessionStorage.removeItem("user");
                setPrijavljen(false);
            } finally {
                setUcitavam(false);
            }
        };

        provjeriSesiju();
    }, []);

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        ucitavam ? (
                            <div>Učitavam...</div>
                        ) : prijavljen ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/home"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Home />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="/pomodoro"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Pomodoro />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Profile />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="/quiz"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Quiz />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="/statistics"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Statistics />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="/videos"
                    element={
                        <ZasticenaRuta ucitavam={ucitavam} prijavljen={prijavljen}>
                            <Videos />
                        </ZasticenaRuta>
                    }
                />
                <Route
                    path="*"
                    element={
                        ucitavam ? (
                            <div>Učitavam...</div>
                        ) : prijavljen ? (
                            <Navigate to="/home" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
