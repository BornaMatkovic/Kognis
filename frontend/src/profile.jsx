import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";
import "./profile.css";

function Profile() {
    const navigate = useNavigate();
    const [korisnik, setKorisnik] = useState(null);
    const [ucitavam, setUcitavam] = useState(true);

    useEffect(() => {
        const ucitajProfil = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/me/", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated) {
                        const { authenticated, ...user } = data;
                        setKorisnik(user);
                        sessionStorage.setItem("user", JSON.stringify(user));
                    } else {
                        navigate("/login", { replace: true });
                    }
                } else {
                    navigate("/login", { replace: true });
                }
            } catch (err) {
                console.error("Greška pri dohvaćanju profila:", err);
                navigate("/login", { replace: true });
            } finally {
                setUcitavam(false);
            }
        };

        ucitajProfil();
    }, [navigate]);

    const odjava = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    if (ucitavam) return <div className="ucitavanje">Učitavam...</div>;
    if (!korisnik) return null;

    let rank
    if (korisnik.score < 50) rank = "Početnik";
    else if (korisnik.score < 150) rank = "Uhodani učenik";
    else if (korisnik.score < 300) rank = "Iskusni učenik";
    else if (korisnik.score < 500) rank = "Napredni učenik";
    else rank = "Majstorski učenik";

    return (
        <>
            <div className="profil">
                <div className="zaglavlje">
                    <div className="avatar">{korisnik.username[0].toUpperCase()}</div>
                    <span className="ime">{korisnik.username}</span>
                </div>
                <div className="sadrzaj">
                    <div className="redak">
                        <span className="oznaka">Email</span>
                        <span className="vrijednost">{korisnik.email}</span>
                    </div>
                    <div className="redak">
                        <span className="oznaka">Rank</span>
                        <span className="vrijednost">{rank}</span>
                    </div>
                    <div className="redak bodovi">
                        <span className="oznaka">Bodovi</span>
                        <span className="vrijednost">{korisnik.score}</span>
                    </div>
                    <button className="odjava" onClick={odjava}>Odjava</button>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Profile;
