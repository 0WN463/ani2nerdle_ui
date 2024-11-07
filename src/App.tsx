import "./App.css";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Lobby from "./lobby/Lobby";

const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

function App() {
  const navigate = useNavigate();

  const createRoom = async () => {
    const rawResponse = await fetch(URL + "/game", {
      method: "POST",
    });

    const content = await rawResponse.text();
    navigate("/game/" + content);
  };

  const home = (
    <div className="App">
      <header className="Ani2Nerdle">
        <button onClick={createRoom}> Create Room </button>
        <Link to="game"> Game </Link>
      </header>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={home} />
      <Route path="/game/:id" element={<Lobby />} />
    </Routes>
  );
}

export default App;