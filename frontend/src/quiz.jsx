import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navigation from "./assets/navigation.jsx";
import "./quiz.css";

function Quiz() {
    const [naslov, setNaslov] = useState('');
    const [prompt, setPrompt] = useState('');
    const [brojPitanja, setBrojPitanja] = useState(10);
    const [pitanja, setPitanja] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState('');
    const [odabraniOdgovori, setOdabraniOdgovori] = useState({});
    const [sidebarOtvoren, setSidebarOtvoren] = useState(false);
    const [spremiKvizovi, setSpremiKvizovi] = useState([]);
    const [loadingKvizovi, setLoadingKvizovi] = useState(false);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    const dohvatiKvizove = async () => {
        setLoadingKvizovi(true);
        try {
            const res = await fetch("http://localhost:8000/api/quiz/", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setSpremiKvizovi(data);
            }
        } catch {
            // tiha greška — sidebar samo ostaje prazan
        }
        setLoadingKvizovi(false);
    };

    useEffect(() => {
        dohvatiKvizove();
    }, []);

    const ucitajKviz = (kviz) => {
        setNaslov(kviz.title);
        setPrompt(kviz.text);
        setPitanja([]);
        setOdabraniOdgovori({});
        setSavedMsg('');
        setSidebarOtvoren(false);
    };

    const systemPrompt = `Generate a quiz based on the text.
    Respond ONLY with a JSON array of objects.
    Each object must have:
    "pitanje": "text of the question",
    "opcije": ["option 1", "option 2", "option 3", "option 4"],
    "tocanIndeks": index of correct answer (0-3).
    Do not use markdown formatting or backticks.`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
    });

    const generirajKviz = async () => {
        if (!prompt) return;
        setLoading(true);
        setPitanja([]);
        setOdabraniOdgovori({});
        setSavedMsg('');

        try {
            const result = await model.generateContent(
                `Generate exactly ${brojPitanja} questions.\n\n${prompt}`
            );
            const responseText = result.response.text();
            const cleanJson = responseText.replace(/```json|```/g, "");
            const data = JSON.parse(cleanJson);
            setPitanja(data);
        } catch (error) {
            console.error("Greška:", error);
            alert("Došlo je do greške pri generiranju kviza. Provjeri konzolu.");
        }
        setLoading(false);
    };

    const spremiKviz = async () => {
        if (!naslov.trim() || !prompt.trim()) {
            alert("Upiši naslov i tekst prije spremanja.");
            return;
        }
        setSaving(true);
        setSavedMsg('');
        try {
            const response = await fetch("http://localhost:8000/api/quiz/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: naslov.trim(), text: prompt.trim() }),
            });
            if (response.ok) {
                setSavedMsg("Kviz je uspješno spremljen!");
                dohvatiKvizove();
            } else {
                const data = await response.json();
                setSavedMsg(data.detail || "Greška pri spremanju.");
            }
        } catch {
            setSavedMsg("Mrežna greška. Provjeri je li backend pokrenut.");
        }
        setSaving(false);
    };

    const handleOdgovor = (pitanjeIndex, oIndex) => {
        if (odabraniOdgovori[pitanjeIndex] !== undefined) return;

        const jeTocno = oIndex === pitanja[pitanjeIndex].tocanIndeks;
        fetch("http://localhost:8000/api/quiz-stats/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ correct: jeTocno ? 1 : 0, wrong: jeTocno ? 0 : 1 }),
        }).catch(() => {});

        setOdabraniOdgovori(prev => ({ ...prev, [pitanjeIndex]: oIndex }));
    };

    const formatirajDatum = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="quiz-page">
            <Navigation />

            {sidebarOtvoren && (
                <div className="quiz-sidebar-backdrop" onClick={() => setSidebarOtvoren(false)} />
            )}

            <aside className={`quiz-sidebar${sidebarOtvoren ? ' is-open' : ''}`}>
                <div className="quiz-sidebar-header">
                    <span className="quiz-sidebar-title">Moji kvizovi</span>
                    <button className="quiz-sidebar-close" onClick={() => setSidebarOtvoren(false)}>✕</button>
                </div>
                <div className="quiz-sidebar-body">
                    {loadingKvizovi ? (
                        <p className="quiz-sidebar-empty">Učitavam...</p>
                    ) : spremiKvizovi.length === 0 ? (
                        <p className="quiz-sidebar-empty">Nema spremljenih kvizova.</p>
                    ) : (
                        spremiKvizovi.map((kviz) => (
                            <button
                                key={kviz.id}
                                className="quiz-sidebar-item"
                                onClick={() => ucitajKviz(kviz)}
                            >
                                <span className="quiz-sidebar-item-title">{kviz.title}</span>
                                <span className="quiz-sidebar-item-date">{formatirajDatum(kviz.created_at)}</span>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            <section className="quiz-generator">
                <div className="quiz-header-row">
                    <h2 className='quiz-header'>Quiz Generator</h2>
                    <button className="quiz-sidebar-toggle" onClick={() => setSidebarOtvoren(true)}>
                        Moji kvizovi
                    </button>
                </div>
                <input
                    type="text"
                    className="quiz-title-input"
                    value={naslov}
                    onChange={(e) => setNaslov(e.target.value)}
                    placeholder="Naslov kviza..."
                />
                <textarea
                    rows="5"
                    className="quiz-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Zalijepi tekst iz kojeg želiš kviz..."
                />
                <div className="quiz-controls">
                    <div className="quiz-select-wrap">
                        <label className="quiz-select-label" htmlFor="quiz-num">Broj pitanja</label>
                        <select
                            id="quiz-num"
                            className="quiz-select"
                            value={brojPitanja}
                            onChange={(e) => setBrojPitanja(Number(e.target.value))}
                        >
                            {[5, 10, 15, 20].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="quiz-actions">
                        <button
                            onClick={generirajKviz}
                            disabled={loading}
                            className="quiz-generate-btn"
                        >
                            {loading ? 'Stvaram kviz...' : 'Generiraj Kviz'}
                        </button>
                        <button
                            onClick={spremiKviz}
                            disabled={saving}
                            className="quiz-save-btn"
                        >
                            {saving ? 'Spremam...' : 'Spremi'}
                        </button>
                    </div>
                </div>
                {savedMsg && (
                    <p className={`quiz-save-msg ${savedMsg.includes('uspješno') ? 'is-success' : 'is-error'}`}>
                        {savedMsg}
                    </p>
                )}
            </section>

            <section className="quiz-list">
                {pitanja.map((p, pIndex) => (
                    <div key={pIndex} className="quiz-card">
                        <h4>{pIndex + 1}. {p.pitanje}</h4>
                        <div className="quiz-options-grid">
                            {p.opcije.map((opcija, oIndex) => {
                                const jeKliknuto = odabraniOdgovori[pIndex] === oIndex;
                                const jeTocno = oIndex === p.tocanIndeks;

                                const buttonClasses = ["quiz-option-btn"];
                                if (jeKliknuto) {
                                    buttonClasses.push("is-selected");
                                    buttonClasses.push(jeTocno ? "is-correct" : "is-incorrect");
                                }

                                return (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleOdgovor(pIndex, oIndex)}
                                        className={buttonClasses.join(" ")}
                                    >
                                        {opcija} {jeKliknuto && (jeTocno ? '✅' : '❌')}
                                    </button>
                                );
                            })}
                        </div>
                        {odabraniOdgovori[pIndex] !== undefined && (
                            <p className="quiz-feedback">
                                {odabraniOdgovori[pIndex] === p.tocanIndeks ? "Točno!" : `Netočno. Točan odgovor je: ${p.opcije[p.tocanIndeks]}`}
                            </p>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Quiz;