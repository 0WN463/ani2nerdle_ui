import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
console.log(URL);
export const socket = io(URL);

type AnimeDetails = {
  id: number;
  title?: string;
  englishTitle?: string;
  imageUrl?: string;
};

const AnimeCard = ({ details }: { details: AnimeDetails }) => {
  return (
    <>
      <header>{details?.title}</header>
      <img src={details.imageUrl} alt={details?.title} />
    </>
  );
};

const Lobby = ({ onStartGame }: { onStartGame: () => void }) => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  return (
    <>
      <div> lobby </div>
      <button onClick={onStartGame}> Start </button>
    </>
  );
};

const Game = ({ id }: { id: number }) => {
  const [details, setDetails] = useState<AnimeDetails>();

  useEffect(() => {
    const getDetails = async () => {
      const rawResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}`);

      const res = await rawResponse.json();

      const result = {
        id,
        title: res.data?.title,
        title_english: res.data?.title_english,
        imageUrl: res.data?.images?.webp?.image_url,
      };

      setDetails(result);
    };

    getDetails();
  }, [id]);

  return details ? <AnimeCard details={details} /> : null;
};

type Stage = { type: "lobby" } | { type: "game"; animeId: number };

const Page = () => {
  const { id } = useParams();
  const [stage, setStage] = useState<Stage>({ type: "lobby" });

  useEffect(() => {
    socket.emit("join_game", { game_id: id, player_id: nanoid() });
  }, [id]);

  useEffect(() => {
    const onPlayerJoin = (data: any) => console.log("player joined", data);
    const onGameStart = (animeId: number) => {
      console.log("game started", animeId);
      setStage({ type: "game", animeId });
    };

    socket.on("player joined", onPlayerJoin);
    socket.on("start game", onGameStart);

    return () => {
      socket.off("player joined", onPlayerJoin);
      socket.off("start game", onGameStart);
    };
  });

  const startGame = () => {
    console.log("start game");
    socket.emit("start game");
  };

  const game =
    stage.type === "lobby" ? (
      <Lobby onStartGame={startGame} />
    ) : (
      <>
        <div> game {id} </div>
        <Game id={stage.animeId} />
      </>
    );

  return game;
};

export default Page;
