import { Routes, Route, useNavigate } from "react-router-dom";
import Game, { GameSolo } from "./game/Game";
import LobbySolo from "./lobby/LobbySolo";
import Main from "./main/Main";
import Playground from "./dev/Dev";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryDelay: 1500,
      gcTime: Infinity,
      staleTime: Infinity,
    },
  },
});

const URL = import.meta.env.VITE_WEB_SERVICE_URL;

const Home = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setLoading(true);
    const rawResponse = await fetch(URL + "/game", {
      method: "POST",
    });

    const content = await rawResponse.text();
    navigate("/game/" + content);
  };

  return (
    <div className="relative h-screen">
      <div className="absolute top-3/4 left-1/2 flex flex-col gap-10 -translate-y-1/2 -translate-x-1/2">
        <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
          <div className="text-6xl font-bold">
            ANI2<span className="text-teal-400">NERDLE</span>
            <span className="text-orange-500">BATTLE</span>
          </div>
        </header>
        {!loading ? (
          <button className="rounded-full bg-sky-300" onClick={createRoom}>
            Create Room
          </button>
        ) : (
          "Loading... Please be patient, server could take a few minutes to start..."
        )}
      </div>
    </div>
  );
};

function App() {
  if (import.meta.env.VITE_IS_PLAYGROUND === "true") {
    return (
      <QueryClientProvider client={queryClient}>
        <Playground />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/multi" element={<Home />} />
        <Route path="/solo" element={<LobbySolo />} />
        <Route path="/solo/game" element={<GameSolo />} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
