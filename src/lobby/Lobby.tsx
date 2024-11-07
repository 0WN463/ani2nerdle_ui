import { useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
console.log(URL);
export const socket = io(URL);

const Lobby = () => {
  const { id } = useParams();

  useEffect(() => {
    socket.emit("join_game", { game_id: id, player_id: nanoid() });
  }, [id]);

  useEffect(() => {
    const onPlayerJoin = (data: any) => console.log("player joined", data);
    socket.on("player joined", onPlayerJoin);

    return () => {
      socket.off("player joined", onPlayerJoin);
    };
  });
  const game = (
    <>
      <div> lobby {id} </div>{" "}
      <button onClick={() => socket.emit("message", "yo")}> Send </button>
    </>
  );

  return game;
};

export default Lobby;
