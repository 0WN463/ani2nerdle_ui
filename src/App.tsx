import "./App.css";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Game from "./game/Game";
import Playground from "./dev/Dev";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

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

  if (process.env.REACT_APP_IS_PLAYGROUND === "true") {
    return (
      <QueryClientProvider client={queryClient}>
        <Playground />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={home} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
