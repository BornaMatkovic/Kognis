import { useNavigate } from "react-router-dom";
import Navigation from "./assets/navigation.jsx";
import bg from "./pitcures/bg.jpg";
import "./home.css";

function Home() {
    const navigate = useNavigate();

    const odjava = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <>
            <div className="homePage">
                <div
                    className="homeBackground"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    Content
                </div>
            </div>
            <Navigation />
        </>
    );
}

export default Home;
