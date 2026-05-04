import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navigation from "./assets/navigation.jsx";
import "./quiz.css";

function Quiz() {
    const [prompt, setPrompt] = useState('');
    const [pitanja, setPitanja] = useState([]);
    const [loading, setLoading] = useState(false);
    const [odabraniOdgovori, setOdabraniOdgovori] = useState({});

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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

        try {
            const result = await model.generateContent(prompt);
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

    const handleOdgovor = (pitanjeIndex, oIndex) => {
        setOdabraniOdgovori(prev => ({
            ...prev,
            [pitanjeIndex]: oIndex
        }));
    };

    return (
        <div className="quiz-page">
            <Navigation />

            <section className="quiz-generator">
                <h2 className='quiz-header'>Quiz Generator</h2>
                <textarea
                    rows="5"
                    className="quiz-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Zalijepi tekst iz kojeg želiš kviz..."
                />
                <br />
                <button
                    onClick={generirajKviz}
                    disabled={loading}
                    className="quiz-generate-btn"
                >
                    {loading ? 'Stvaram kviz...' : 'Generiraj Kviz'}
                </button>
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