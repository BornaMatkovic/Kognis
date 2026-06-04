import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navigation from "./assets/navigation.jsx";
import "./quiz.css";

function Quiz() {
    const [naslov, setNaslov] = useState('');
    const [prompt, setPrompt] = useState('');
    const [brojPitanja, setBrojPitanja] = useState(10);
    const [pitanja, setPitanja] = useState([]);
    const [ucitava, setUcitava] = useState(false);
    const [seSpremava, setSeSpremava] = useState(false);
    const [porukaSpremanja, setPorukaSpremanja] = useState('');
    const [odabraniOdgovori, setOdabraniOdgovori] = useState({});
    const [sidebarOtvoren, setSidebarOtvoren] = useState(false);
    const [spremiKvizovi, setSpremiKvizovi] = useState([]);
    const [loadingKvizovi, setLoadingKvizovi] = useState(false);
    const [dragging, setDragging] = useState(false);

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
        setPorukaSpremanja('');
        setSidebarOtvoren(false);
    };

    const generirajKviz = async () => {
        if (!prompt) return;
        setUcitava(true);
        setPitanja([]);
        setOdabraniOdgovori({});
        setPorukaSpremanja('');

        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `Generate a quiz based on the text.
            Respond ONLY with a JSON array of objects.
            Each object must have:
            "pitanje": "text of the question",
            "opcije": ["option 1", "option 2", "option 3", "option 4"],
            "tocanIndeks": index of correct answer (0-3).
            Do not use markdown formatting or backticks.`
        });

        setBrojPitanja(brojPitanja);

        try {
            const result = await model.generateContent(
                `Generate exactly ${brojPitanja} questions.\n\n${prompt}`
            );
            const responseText = result.response.text();
            const data = JSON.parse(responseText);
            setPitanja(data);
        } catch (error) {
            console.error("Greška:", error);
            alert("Došlo je do greške pri generiranju kviza. Provjeri konzolu.");
        }
        setUcitava(false);
    };

    const spremiKviz = async () => {
        if (!naslov.trim() || !prompt.trim()) {
            alert("Upiši naslov i tekst prije spremanja.");
            return;
        }
        setSeSpremava(true);
        setPorukaSpremanja('');
        try {
            const response = await fetch("http://localhost:8000/api/quiz/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title: naslov.trim(), text: prompt.trim() }),
            });
            if (response.ok) {
                setPorukaSpremanja("Kviz je uspješno spremljen!");
                dohvatiKvizove();
            } else {
                const data = await response.json();
                setPorukaSpremanja(data.detail || "Greška pri spremanju.");
            }
        } catch {
            setPorukaSpremanja("Mrežna greška. Provjeri je li backend pokrenut.");
        }
        setSeSpremava(false);
    };

    const handleOdgovor = (pitanjeIndex, oIndex) => {
        if (odabraniOdgovori[pitanjeIndex] !== undefined) return;

        const jeTocno = oIndex === pitanja[pitanjeIndex].tocanIndeks;
        fetch("http://localhost:8000/api/quiz-stats/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ correct: jeTocno ? 1 : 0, wrong: jeTocno ? 0 : 1 }),
        }).catch(() => { });

        setOdabraniOdgovori(prev => ({ ...prev, [pitanjeIndex]: oIndex }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPrompt(ev.target.result);
        reader.readAsText(file, "UTF-8");
    };

    const formatirajDatum = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="stranica">
            <Navigation />

            {sidebarOtvoren && (
                <div className="zastor" onClick={() => setSidebarOtvoren(false)} />
            )}

            <aside className={`bocna${sidebarOtvoren ? ' is-open' : ''}`}>
                <div className="bocna-vrh">
                    <span className="bocna-naslov">Moji kvizovi</span>
                    <button className="bocna-zatvori" onClick={() => setSidebarOtvoren(false)}>✕</button>
                </div>
                <div className="bocna-tijelo">
                    {loadingKvizovi ? (
                        <p className="bocna-prazno">Učitavam...</p>
                    ) : spremiKvizovi.length === 0 ? (
                        <p className="bocna-prazno">Nema spremljenih kvizova.</p>
                    ) : (
                        spremiKvizovi.map((kviz) => (
                            <button
                                key={kviz.id}
                                className="bocna-stavka"
                                onClick={() => ucitajKviz(kviz)}
                            >
                                <span className="bocna-stavka-naziv">{kviz.title}</span>
                                <span className="bocna-stavka-datum">{formatirajDatum(kviz.created_at)}</span>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            <section className="generator">
                <div className="red-naslova">
                    <h2 className='naslov'>Generator kvizova</h2>
                    <button className="bocna-gumb" onClick={() => setSidebarOtvoren(true)}>
                        Moji kvizovi
                    </button>
                </div>
                <input
                    type="text"
                    className="naslov-unos"
                    value={naslov}
                    onChange={(e) => setNaslov(e.target.value)}
                    placeholder="Naslov kviza..."
                />
                <div
                    className={`zona${dragging ? " is-dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <textarea
                        rows="5"
                        className="unos"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Zalijepi tekst iz kojeg želiš kviz..."
                    />
                    {dragging && (
                        <div className="sloj">
                            <ion-icon name="document-text-outline"></ion-icon>
                            <span>Ispusti fajl ovdje</span>
                        </div>
                    )}
                    <p className="savjet">
                        <ion-icon name="attach-outline"></ion-icon>
                        Možeš i povući fajl (.txt, .md, .csv…)
                    </p>
                </div>
                <div className="kontrole">
                    <div className="omot">
                        <label className="labela" htmlFor="quiz-num">Broj pitanja</label>
                        <select
                            id="quiz-num"
                            className="padajuci"
                            value={brojPitanja}
                            onChange={(e) => setBrojPitanja(Number(e.target.value))}
                        >
                            {[5, 10, 15, 20].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="akcije">
                        <button
                            onClick={generirajKviz}
                            disabled={ucitava}
                            className="generiraj"
                        >
                            {ucitava ? 'Stvaram kviz...' : 'Generiraj Kviz'}
                        </button>
                        <button
                            onClick={spremiKviz}
                            disabled={seSpremava}
                            className="spremi"
                        >
                            {seSpremava ? 'Spremam...' : 'Spremi'}
                        </button>
                    </div>
                </div>
                {porukaSpremanja && (
                    <p className={`poruka ${porukaSpremanja.includes('uspješno') ? 'is-success' : 'is-error'}`}>
                        {porukaSpremanja}
                    </p>
                )}
            </section>

            <section className="popis">
                {pitanja.map((p, pIndex) => (
                    <div key={pIndex} className="pitanje-kartica">
                        <h4>{pIndex + 1}. {p.pitanje}</h4>
                        <div className="opcije">
                            {p.opcije.map((opcija, oIndex) => {
                                const jeKliknuto = odabraniOdgovori[pIndex] === oIndex;
                                const jeTocno = oIndex === p.tocanIndeks;
                                const jeOdgovoreno = odabraniOdgovori[pIndex] !== undefined;

                                const buttonClasses = ["opcija"];
                                if (jeKliknuto) {
                                    buttonClasses.push("is-selected");
                                    buttonClasses.push(jeTocno ? "is-correct" : "is-incorrect");
                                } else if (jeOdgovoreno && jeTocno) {
                                    buttonClasses.push("is-correct-reveal");
                                }

                                return (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleOdgovor(pIndex, oIndex)}
                                        className={buttonClasses.join(" ")}
                                    >
                                        <span className="opcija-slovo">{['A', 'B', 'C', 'D'][oIndex]}</span>
                                        <span className="opcija-tekst">{opcija}</span>
                                        {jeKliknuto && (
                                            <span className="opcija-ikona">{jeTocno ? '✓' : '✗'}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {odabraniOdgovori[pIndex] !== undefined && (
                            <p className="komentar">
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
