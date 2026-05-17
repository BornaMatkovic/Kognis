import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [korisnickoIme, setKorisnickoIme] = useState("");
    const [email, setEmail] = useState("");
    const [lozinka, setLozinka] = useState("");
    const [greska, setGreska] = useState("");
    const [ucitavam, setUcitavam] = useState(false);
    const navigate = useNavigate();

    const registracija = async (e) => {
        e.preventDefault();
        setGreska("");
        setUcitavam(true);

        try {
            const res = await fetch("http://localhost:8000/api/users/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: korisnickoIme, email, password: lozinka }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Račun je uspješno kreiran!");
                navigate("/login");
            } else {
                setGreska(data.detail || "Registracija nije uspjela. Pokušaj ponovo.");
            }
        } catch (err) {
            setGreska("Mrežna greška. Provjeri je li backend aktivan.");
            console.error("Greška pri registraciji:", err);
        } finally {
            setUcitavam(false);
        }
    };

    return (
        <div className="LoginCard">
            <h1>REGISTER</h1>
            <form onSubmit={registracija}>
                <input
                    type="text"
                    placeholder="Korisničko ime"
                    value={korisnickoIme}
                    onChange={(e) => setKorisnickoIme(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Lozinka"
                    value={lozinka}
                    onChange={(e) => setLozinka(e.target.value)}
                    required
                />
                {greska && <div style={{ color: "red", margin: "10px 0" }}>{greska}</div>}
                <button type="submit" disabled={ucitavam}>
                    {ucitavam ? "Kreiram račun..." : "Kreiraj račun"}
                </button>
            </form>
        </div>
    );
}

export default Register;
