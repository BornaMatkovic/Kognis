import { useState, useEffect } from "react";
import Navigation from "./assets/navigation.jsx";
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    XAxis, YAxis,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import "./statistics.css";

function Statistics() {
    const [korisnik, setKorisnik] = useState(null);
    const [ucitavam, setUcitavam] = useState(true);

    useEffect(() => {
        const ucitajStatistiku = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/me/", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        const { authenticated, ...user } = data;
                        setKorisnik(user);
                    }
                }
            } catch {
            } finally {
                setUcitavam(false);
            }
        };
        ucitajStatistiku();
    }, []);

    if (ucitavam) return <div className="stats-loading">Učitavam statistiku...</div>;
    if (!korisnik) return null;

    const { quiz_correct, quiz_wrong, score, timer_minutes, timer_interrupts } = korisnik;
    const ukupnoOdgovora = quiz_correct + quiz_wrong;
    const tocnost = ukupnoOdgovora > 0 ? Math.round((quiz_correct / ukupnoOdgovora) * 100) : 0;
    const tocnostOgranicena = Math.max(0, Math.min(100, tocnost));

    const podaciTocnosti = [
        { name: "Točno", value: tocnostOgranicena },
        { name: "Preostalo", value: 100 - tocnostOgranicena },
    ];

    const podaciPita = [
        { name: "Točno", value: quiz_correct },
        { name: "Netočno", value: quiz_wrong },
    ];
    const bojePita = ["#6366f1", "#f87171"];

    const podaciStupci = [
        { name: "Točno", vrijednost: quiz_correct },
        { name: "Netočno", vrijednost: quiz_wrong },
        { name: "Ukupno", vrijednost: ukupnoOdgovora },
    ];

    const podaciPomodoro = [
        { name: "Minuta", vrijednost: timer_minutes, fill: "#7c3aed" },
        { name: "Prekida", vrijednost: timer_interrupts, fill: "#a78bfa" },
    ];

    return (
        <div className="stats-page">
            <h1 className="stats-title">Statistika</h1>

            <div className="stats-grid">
                <div className="stats-card stats-card--accuracy">
                    <h2 className="stats-card-title">Točnost odgovora</h2>
                    <div className="stats-accuracy-wrap">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={podaciTocnosti}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#6366f1" />
                                    <Cell fill="#ede9fe" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="stats-accuracy-label">
                            <span className="stats-accuracy-pct">{tocnost}%</span>
                            <span className="stats-accuracy-sub">{ukupnoOdgovora} odgovora ukupno</span>
                        </div>
                    </div>
                </div>

                <div className="stats-card stats-card--score">
                    <h2 className="stats-card-title">Bodovi</h2>
                    <div className="stats-score-value">{score}</div>
                    <div className="stats-score-sub">bodova</div>
                </div>

                <div className="stats-card stats-card--pie">
                    <h2 className="stats-card-title">Točni vs Netočni odgovori</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={podaciPita}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                                labelLine={false}
                            >
                                {podaciPita.map((_, i) => (
                                    <Cell key={i} fill={bojePita[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="stats-card stats-card--bar">
                    <h2 className="stats-card-title">Pregled odgovora</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={podaciStupci} barSize={44}>
                            <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#6b7280" }} />
                            <YAxis tick={{ fontSize: 13, fill: "#6b7280" }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="vrijednost" radius={[8, 8, 0, 0]}>
                                {podaciStupci.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={i === 0 ? "#6366f1" : i === 1 ? "#f87171" : "#a78bfa"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="stats-card stats-card--pomodoro">
                    <h2 className="stats-card-title">Pomodoro</h2>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={podaciPomodoro} barSize={44}>
                            <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#6b7280" }} />
                            <YAxis tick={{ fontSize: 13, fill: "#6b7280" }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="vrijednost" radius={[8, 8, 0, 0]}>
                                {podaciPomodoro.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <Navigation />
        </div>
    );
}

export default Statistics;
