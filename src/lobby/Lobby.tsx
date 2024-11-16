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
    <div className="relative h-screen">
      <div className="absolute top-3/4 left-1/2 flex flex-col gap-10 -translate-y-1/2 -translate-x-1/2">
        <button
          className="text-3xl bg-sky-300 rounded mx-3 p-3"
          onClick={startGame}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default Lobby;
