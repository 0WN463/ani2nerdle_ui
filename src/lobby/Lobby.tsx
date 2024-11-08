import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";

import Select from "react-select";

// Adapted from https://raw.githubusercontent.com/uidotdev/usehooks/refs/heads/main/index.js
const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { error, data: res } = useQuery({
    queryKey: ["searchAnime", debouncedSearchTerm],
    queryFn: async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${debouncedSearchTerm}&sfw=true`,
      );
      return await response.json();
    },
    enabled: debouncedSearchTerm !== "",
  });

  const formatLabel = (a: any) => (
    <>
      <header style={{ fontWeight: "bold" }}>{a?.title}</header>
      <div>{a?.title_english}</div>
    </>
  );

  const options = res?.data?.map((a: any) => ({
    value: a?.mal_id,
    label: formatLabel(a),
  }));

  const errorDisplay = error ? (
    <div>
      An error has occurred{" "}
      {error instanceof Error ? error.message : "Unknown error"}
    </div>
  ) : null;

  return (
    <>
      {errorDisplay}
      <Select
        onInputChange={setSearchTerm}
        options={options}
        onChange={console.log}
        filterOption={() => true}
      />
    </>
  );
};

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
  const { error, data: res } = useQuery({
    queryKey: ["animeDetails"],
    queryFn: async () => {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      return await response.json();
    },
  });

  if (error) return <>An error has occurred: + {error}</>;

  const details = {
    id,
    title: res?.data?.title,
    title_english: res?.data?.title_english,
    imageUrl: res?.data?.images?.webp?.image_url,
  };

  return (
    <>
      <SearchBar />
      {res && <AnimeCard details={details} />}
    </>
  );
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
