import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

type LobbyStatus = "unconnected" | "host" | "guest" | "failed";

const Lobby = ({
  onGameStarted,
  playerId,
  id,
}: {
  onGameStarted: (animeId: number, isHost: boolean, ts: number) => void;
  playerId: string;
  id: string;
}) => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  const [status, setStatus] = useState<LobbyStatus>("unconnected");
  const [opponent, setOpponent] = useState<string>();

  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    socket.emit(
      "join_game",
      { game_id: id, player_id: playerId },
      (msg: string, hostId: string) => {
        if (msg === "ok_new") {
          setStatus("host");
          return;
        }

        if (msg === "ok_paired") {
          setStatus("guest");
          setOpponent(hostId);
          return;
        }

        setStatus("failed");
      },
    );
  }, [id]);

  const onPlayerJoined = (playerId: string) => {
    setOpponent(playerId);
  };

  useEffect(() => {
    const onGameStartedFunc = (animeId: number, ts: number) => {
      onGameStarted(animeId, status === "host", ts);
    };

    socket.on("start game", onGameStartedFunc);
    socket.on("player joined", onPlayerJoined);

    return () => {
      socket.off("start game", onGameStartedFunc);
      socket.off("player joined", onPlayerJoined);
    };
  }, [onGameStarted, status]);

  const startGame = () => {
    socket.emit("start game");
  };

  if (status === "failed") return "Invalid lobby";

  return (
    <div className="relative h-screen">
      <div className="absolute top-3/4 left-1/2 flex flex-col gap-10 -translate-y-1/2 -translate-x-1/2">
        {status === "host" ? (
          <button
            className="text-3xl bg-sky-300 rounded mx-3 p-3"
            onClick={startGame}
          >
            Start
          </button>
        ) : (
          "Waiting for host"
        )}
        <div>My ID: {playerId}</div>
        <div>Opponent ID: {opponent}</div>
      </div>
    </div>
  );
};

export default Lobby;
