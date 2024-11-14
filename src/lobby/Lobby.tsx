import { useEffect } from "react";
import { socket } from "../lib/socket";

const Lobby = ({
  onGameStarted,
}: {
  onGameStarted: (animeId: number) => void;
}) => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    socket.on("start game", onGameStarted);
    return () => {
      socket.off("start game", onGameStarted);
    };
  }, [onGameStarted]);

  const startGame = () => {
    socket.emit("start game");
  };

  return (
    <div className="App" style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          top: "80%",
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <button style={{ fontSize: "xx-large" }} onClick={startGame}>
          Start
        </button>
      </div>
    </div>
  );
};

export default Lobby;
