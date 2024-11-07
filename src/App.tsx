import "./App.css";
import { io } from "socket.io-client";
import { Link, Routes, Route, useNavigate } from "react-router-dom";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
console.log(URL);
export const socket = io(URL);

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

  const game = <div> game </div>;

  return (
    <Routes>
      <Route path="/" element={home} />
      <Route path="/game/:id" element={game} />
    </Routes>
  );
}

export default App;
