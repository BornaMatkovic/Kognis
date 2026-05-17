import { useState } from "react";
import Navigation from "./assets/navigation.jsx";
import "./videos.css";

const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

function Videos() {
    const [tema, setTema] = useState("");
    const [videi, setVidei] = useState([]);
    const [ucitavam, setUcitavam] = useState(false);
    const [greska, setGreska] = useState("");
    const [pretrazeno, setPretrazeno] = useState(false);

    const pretrazi = async (e) => {
        e.preventDefault();
        if (!tema.trim()) return;

        setUcitavam(true);
        setGreska("");
        setVidei([]);

        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(tema)}&type=video&maxResults=12&relevanceLanguage=hr&key=${YT_KEY}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                setGreska(data.error?.message || "Greška pri dohvaćanju videa.");
                return;
            }

            setVidei(data.items || []);
            setPretrazeno(true);
        } catch {
            setGreska("Nije moguće dohvatiti videe. Provjeri internet ili API ključ.");
        } finally {
            setUcitavam(false);
        }
    };

    return (
        <>
            <div className="videi">
                <h1 className="natpis">VIDEO LEKCIJE</h1>

                <form className="pretraga" onSubmit={pretrazi}>
                    <input
                        className="trazilica"
                        type="text"
                        placeholder="Unesi temu za učenje…"
                        value={tema}
                        onChange={(e) => setTema(e.target.value)}
                    />
                    <button className="gumb" type="submit" disabled={ucitavam || !tema.trim()}>
                        {ucitavam ? "Tražim…" : "Pretraži"}
                    </button>
                </form>

                {greska && <p className="greska">{greska}</p>}

                {!pretrazeno && !ucitavam && (
                    <div className="prazno">
                        <ion-icon name="videocam-outline" class="prazno-ikona"></ion-icon>
                        <p>Upiši temu i pronađi edukativne videe</p>
                    </div>
                )}

                {ucitavam && (
                    <div className="punjenje">
                        <div className="tocak"></div>
                        <p>Tražim videe…</p>
                    </div>
                )}

                {videi.length > 0 && (
                    <div className="mreza">
                        {videi.map((v) => {
                            const id = v.id.videoId;
                            const { title, channelTitle, thumbnails } = v.snippet;
                            return (
                                <a
                                    key={id}
                                    className="plocica"
                                    href={`https://www.youtube.com/watch?v=${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="slicica-omot">
                                        <img
                                            className="slicica"
                                            src={thumbnails.medium.url}
                                            alt={title}
                                        />
                                        <div className="pokretanje">
                                            <ion-icon name="play-circle-outline"></ion-icon>
                                        </div>
                                    </div>
                                    <div className="info">
                                        <p className="naziv">{title}</p>
                                        <p className="kanal">{channelTitle}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}

                {pretrazeno && videi.length === 0 && !ucitavam && !greska && (
                    <p className="bez-rezultata">Nema rezultata za "{tema}".</p>
                )}
            </div>

            <Navigation />
        </>
    );
}

export default Videos;
