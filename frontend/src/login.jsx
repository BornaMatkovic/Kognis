import { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

function Login() {
    const [identifikator, setIdentifikator] = useState("");
    const [lozinka, setLozinka] = useState("");
    const [greska, setGreska] = useState("");
    const [ucitavam, setUcitavam] = useState(false);
    const navigate = useNavigate();

    const prijava = async (e) => {
        e.preventDefault();
        setGreska("");
        setUcitavam(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username: identifikator, password: lozinka }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.removeItem("user");
                sessionStorage.setItem("user", JSON.stringify(data));
                navigate("/home");
            } else {
                setGreska(data.detail || "Pogrešni podaci. Pokušaj ponovo.");
            }
        } catch (err) {
            setGreska("Mrežna greška. Provjeri je li backend aktivan.");
            console.error("Greška pri prijavi:", err);
        } finally {
            setUcitavam(false);
        }
    };

    return (
        <>
            <div className="prijava">
                <h1>LOGIN</h1>
                <form onSubmit={prijava}>
                    <input
                        type="text"
                        placeholder="Korisničko ime ili e-mail"
                        value={identifikator}
                        onChange={(e) => setIdentifikator(e.target.value)}
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
                    <span
                        className="na-registraciju"
                        onClick={() => navigate("/register")}
                        style={{ cursor: "pointer", color: "blue" }}
                    >
                        Registriraj se
                    </span>
                    <button type="submit" disabled={ucitavam}>
                        {ucitavam ? "Prijava..." : "Login"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default Login;
