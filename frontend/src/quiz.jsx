import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navigation from "./assets/navigation.jsx";

function Quiz() {
    const [prompt, setPrompt] = useState('');
    const [odgovor, setOdgovor] = useState('');
    const [loading, setLoading] = useState(false);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: "Generate quiz questions exclusively based on the text I will send you. The response must contain only the questions and the offered answers, without any introductory or accompanying text. The format of each question must be: question a) answer 1 b) answer 2 c) answer 3 d) answer 4. Next to the correct answer, place the mark (T) immediately after the answer text, inside parentheses. Do not use quotation marks in the final output. Here is the text:" });

    const generirajTekst = async () => {
        if (!prompt) return;

        setLoading(true);
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setOdgovor(response.text());
        } catch (error) {
            console.error("Greška:", error);
            setOdgovor("Došlo je do greške pri dohvaćanju odgovora.");
        }
        setLoading(false);
    };

    return (
        <>
            <div style={{ padding: '20px' }}>
                <h2>Pitaj Gemini</h2>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Unesi pitanje..."
                />
                <button onClick={generirajTekst} disabled={loading}>
                    {loading ? 'Generiram...' : 'Pošalji'}
                </button>

                <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                    <strong>Odgovor:</strong>
                    <p>{odgovor}</p>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Quiz;