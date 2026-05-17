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
            <div className="videos-page">
                <h1 className="videos-title">VIDEO LEKCIJE</h1>

                <form className="videos-search-wrap" onSubmit={pretrazi}>
                    <input
                        className="videos-input"
                        type="text"
                        placeholder="Unesi temu za učenje…"
                        value={tema}
                        onChange={(e) => setTema(e.target.value)}
                    />
                    <button className="videos-btn" type="submit" disabled={ucitavam || !tema.trim()}>
                        {ucitavam ? "Tražim…" : "Pretraži"}
                    </button>
                </form>

                {greska && <p className="videos-error">{greska}</p>}

                {!pretrazeno && !ucitavam && (
                    <div className="videos-empty">
                        <ion-icon name="videocam-outline" class="videos-empty-icon"></ion-icon>
                        <p>Upiši temu i pronađi edukativne videe</p>
                    </div>
                )}

                {ucitavam && (
                    <div className="videos-loading">
                        <div className="videos-spinner"></div>
                        <p>Tražim videe…</p>
                    </div>
                )}

                {videi.length > 0 && (
                    <div className="videos-grid">
                        {videi.map((v) => {
                            const id = v.id.videoId;
                            const { title, channelTitle, thumbnails } = v.snippet;
                            return (
                                <a
                                    key={id}
                                    className="video-card"
                                    href={`https://www.youtube.com/watch?v=${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="video-thumb-wrap">
                                        <img
                                            className="video-thumb"
                                            src={thumbnails.medium.url}
                                            alt={title}
                                        />
                                        <div className="video-play">
                                            <ion-icon name="play-circle-outline"></ion-icon>
                                        </div>
                                    </div>
                                    <div className="video-info">
                                        <p className="video-title">{title}</p>
                                        <p className="video-channel">{channelTitle}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}

                {pretrazeno && videi.length === 0 && !ucitavam && !greska && (
                    <p className="videos-no-results">Nema rezultata za "{tema}".</p>
                )}
            </div>

            <Navigation />
        </>
    );
}

export default Videos;
