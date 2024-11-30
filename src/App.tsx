import { Routes, Route, useNavigate } from "react-router-dom";
import Game, { GameSolo } from "./game/Game";
import LobbySolo from "./lobby/LobbySolo";
import Main from "./main/Main";
import Playground from "./dev/Dev";
import Support from "./support/Support";
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
    <>
      <div className="">
        <div className="flex flex-col gap-2">
          <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
            <div className="text-3xl sm:text-6xl font-bold mt-48 text-center">
              ANI2<span className="text-teal-400">NERDLE</span>
              <span className="text-orange-500">BATTLE</span>
            </div>
          </header>
          {!loading ? (
            <button
              className="text-xl bg-sky-300 rounded mx-auto px-2 py-3"
              onClick={createRoom}
            >
              Create Room
            </button>
          ) : (
            "Loading... Please be patient, server could take a few minutes to start..."
          )}
        </div>
      </div>
      <Support />
    </>
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
