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
    socket.on("start game", onGameStarted);
    return () => {
      socket.off("start game", onGameStarted);
    };
  }, [onGameStarted]);

  const startGame = () => {
    socket.emit("start game");
  };

  return (
    <>
      <div> lobby </div>
      <button onClick={startGame}> Start </button>
    </>
  );
};

export default Lobby;
