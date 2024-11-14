import { Routes, Route, useNavigate } from "react-router-dom";
import Game, { GameSolo } from "./game/Game";
import LobbySolo from "./lobby/LobbySolo";
import Playground from "./dev/Dev";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryDelay: 1500,
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  },
});

const URL = process.env.REACT_APP_WEB_SERVICE_URL;

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
    <div className="App" style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          top: "80%",
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          gap: "3em",
        }}
      >
        <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
          <div style={{ fontSize: "xxx-large" }}>
            ANI2<span style={{ color: "aquamarine" }}>NERDLE</span>
            <span style={{ color: "coral" }}>BATTLE</span>
          </div>
        </header>
        <button onClick={createRoom}> Create Room </button>
      </div>
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
        <Route path="/solo" element={<LobbySolo />} />
        <Route path="/solo/game" element={<GameSolo />} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
