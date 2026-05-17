import React, { useState, useEffect } from "react";
import Navigation from "./assets/navigation.jsx";
import "./pomodoro.css";

const KLJUC_POHRANE = "pomodoroTimerState";

const pocetnoStanje = () => ({
    vrijemePreostalo: 25 * 60,
    maksimalnoVrijeme: 25 * 60,
    aktivan: false,
    zadnjaMinuta: 25,
    zavrsetakAt: null,
});

const ucitajStanje = () => {
    try {
        const raw = sessionStorage.getItem(KLJUC_POHRANE);
        if (!raw) return pocetnoStanje();

        const parsed = JSON.parse(raw);
        const stanje = { ...pocetnoStanje(), ...parsed };

        if (stanje.aktivan && stanje.zavrsetakAt) {
            const preostalo = Math.max(0, Math.ceil((stanje.zavrsetakAt - Date.now()) / 1000));
            stanje.vrijemePreostalo = preostalo;
            if (preostalo === 0) {
                stanje.aktivan = false;
                stanje.zavrsetakAt = null;
                stanje.zadnjaMinuta = 0;
            }
        }

        return stanje;
    } catch (err) {
        console.error("Greška pri učitavanju stanja:", err);
        return pocetnoStanje();
    }
};

function Pomodoro() {
    const init = ucitajStanje();
    const [vrijemePreostalo, setVrijemePreostalo] = useState(init.vrijemePreostalo);
    const [maksimalnoVrijeme, setMaksimalnoVrijeme] = useState(init.maksimalnoVrijeme);
    const [aktivan, setAktivan] = useState(init.aktivan);
    const [zadnjaMinuta, setZadnjaMinuta] = useState(init.zadnjaMinuta);
    const [zavrsetakAt, setZavrsetakAt] = useState(init.zavrsetakAt);

    const formatirajVrijeme = (sekunde) => {
        const min = Math.floor(sekunde / 60);
        const sek = sekunde % 60;
        return `${min.toString().padStart(2, '0')}:${sek.toString().padStart(2, '0')}`;
    };

    const azurirajStatistiku = async ({ timer_minutes = 0, timer_interrupts = 0, scoreChange = 0 }) => {
        try {
            const user = JSON.parse(sessionStorage.getItem("user"));
            if (!user || !user.id) return;

            const noviPodaci = {
                timer_minutes: (user.timer_minutes || 0) + timer_minutes,
                timer_interrupts: (user.timer_interrupts || 0) + timer_interrupts,
                score: Math.max(0, (user.score || 0) + scoreChange),
            };

            const res = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(noviPodaci),
            });

            if (res.ok) {
                const azuriraniKorisnik = await res.json();
                sessionStorage.setItem("user", JSON.stringify(azuriraniKorisnik));
            }
        } catch (err) {
            console.error("Greška pri ažuriranju statistike:", err);
        }
    };

    const pokreniPomodoro = () => {
        setVrijemePreostalo(25 * 60);
        setMaksimalnoVrijeme(25 * 60);
        setZadnjaMinuta(25);
        setAktivan(false);
        setZavrsetakAt(null);
    };

    const pokreniKratkuPauzu = () => {
        setVrijemePreostalo(5 * 60);
        setMaksimalnoVrijeme(5 * 60);
        setZadnjaMinuta(5);
        setAktivan(false);
        setZavrsetakAt(null);
    };

    const pokreniDuguPauzu = () => {
        setVrijemePreostalo(20 * 60);
        setMaksimalnoVrijeme(20 * 60);
        setZadnjaMinuta(20);
        setAktivan(false);
        setZavrsetakAt(null);
    };

    const pokreni = () => {
        if (vrijemePreostalo <= 0) return;
        setAktivan(true);
        setZavrsetakAt(Date.now() + (vrijemePreostalo * 1000));
    };

    const zaustavi = () => {
        setAktivan(false);
        setZavrsetakAt(null);
        if (aktivan) {
            azurirajStatistiku({ timer_interrupts: 1, scoreChange: -3 });
        }
    };

    useEffect(() => {
        if (!aktivan || !zavrsetakAt) return undefined;

        const tik = () => {
            const preostalo = Math.max(0, Math.ceil((zavrsetakAt - Date.now()) / 1000));
            setVrijemePreostalo(preostalo);

            if (preostalo === 0) {
                setAktivan(false);
                setZavrsetakAt(null);
                setZadnjaMinuta(0);
            }
        };

        tik();
        const interval = setInterval(tik, 1000);
        return () => clearInterval(interval);
    }, [aktivan, zavrsetakAt]);

    useEffect(() => {
        const trenutnaMinuta = Math.floor(vrijemePreostalo / 60);
        if (aktivan && trenutnaMinuta < zadnjaMinuta) {
            const zavrseneMinute = zadnjaMinuta - trenutnaMinuta;
            azurirajStatistiku({ timer_minutes: zavrseneMinute, scoreChange: zavrseneMinute });
            setZadnjaMinuta(trenutnaMinuta);
        }
    }, [vrijemePreostalo, aktivan, zadnjaMinuta]);

    useEffect(() => {
        try {
            sessionStorage.setItem(KLJUC_POHRANE, JSON.stringify({
                vrijemePreostalo,
                maksimalnoVrijeme,
                aktivan,
                zadnjaMinuta,
                zavrsetakAt,
            }));
        } catch (err) {
            console.error("Greška pri pohrani stanja:", err);
        }
    }, [vrijemePreostalo, maksimalnoVrijeme, aktivan, zadnjaMinuta, zavrsetakAt]);

    const resetiraj = () => {
        if (vrijemePreostalo > 0) {
            azurirajStatistiku({ timer_interrupts: 1, scoreChange: -5 });
        }
        setAktivan(false);
        setZavrsetakAt(null);
        setVrijemePreostalo(25 * 60);
        setMaksimalnoVrijeme(25 * 60);
        setZadnjaMinuta(25);
    };

    const gradijentPozadine = () => {
        const postotak = maksimalnoVrijeme > 0 ? (vrijemePreostalo / maksimalnoVrijeme) * 100 : 0;
        const bijelo = 100 - postotak;
        return `linear-gradient(to bottom, #f5f4ff 0%, #f5f4ff ${bijelo}%, #6366f1 ${bijelo}%, #7c3aed 100%)`;
    };

    return (
        <>
            <div className="kartica" style={{ background: gradijentPozadine() }}>
                <div className="naslov">
                    <h1>POMODORO TAJMERI</h1>
                </div>

                <div className="odabir">
                    <button onClick={pokreniPomodoro}>pomodoro</button>
                    <button onClick={pokreniKratkuPauzu}>kratka pauza</button>
                    <button onClick={pokreniDuguPauzu}>duga pauza</button>
                </div>
                <div className="tajmer">
                    <h1>{formatirajVrijeme(vrijemePreostalo)}</h1>
                    <div className="gumbi">
                        <button onClick={pokreni} disabled={aktivan}>KRENI</button>
                        <button onClick={zaustavi} disabled={!aktivan}>STANI</button>
                        <button onClick={resetiraj}>RESET</button>
                    </div>
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Pomodoro;
