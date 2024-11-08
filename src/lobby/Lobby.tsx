import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";

import Select from "react-select";

// Adapted from https://raw.githubusercontent.com/uidotdev/usehooks/refs/heads/main/index.js
const useDebounce = <T,>(value: T, delay: number) => {
  const [state, setState] = useState<T>(value);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(state);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [state, delay]);

  return [debouncedValue, setState] as const;
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useDebounce("", 300);

  const { error, data: res } = useQuery({
    queryKey: ["searchAnime", searchTerm],
    queryFn: async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${searchTerm}&sfw=true`,
      );
      return await response.json();
    },
    enabled: searchTerm !== "",
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

type Anime = {
  id: number;
};

type GameState = {
  animes: Anime[];
};

type Linkage = {
  name: string;
  id: number;
  chara_name: string;
  chara_img_url?: string;
};

const useLinkages = (animeId: number) => {
  const { error, data: res } = useQuery({
    queryKey: ["animeLinkages", animeId],
    queryFn: async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${animeId}/characters`,
      );
      return await response.json();
    },
  });

  if (error) return { linkages: null, error };

  const charaToLinkage = (data: any) => {
    const japVa = data.voice_actors.find(
      (role: any) => role.language === "Japanese",
    );

    if (!japVa) return null;

    return {
      name: japVa.person.name,
      id: japVa.person.mal_id,
      chara_name: data.character.name,
      chara_img_url: data.character.images.webp.image_url,
    };
  };

  return {
    linkages: res?.data
      ?.map(charaToLinkage)
      .filter((l?: Linkage) => l !== undefined),
    error,
  };
};

const useGameState = (id: number) => {
  const [state, setState] = useState<GameState>();
  const { linkages } = useLinkages(id);

  console.log(linkages);

  return [state];
};

const useAnimeDetails = (id: number) => {
  const { error, data: res } = useQuery({
    queryKey: ["animeDetails", id],
    queryFn: async () => {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      return await response.json();
    },
  });

  if (error) return { details: null, error };

  const details = {
    id,
    title: res?.data?.title,
    title_english: res?.data?.title_english,
    imageUrl: res?.data?.images?.webp?.image_url,
  };

  return { details, error };
};

const Game = ({ id }: { id: number }) => {
  const [gameState] = useGameState(id);
  const { error, details } = useAnimeDetails(id);

  if (error) return <>An error has occurred: + {error}</>;

  return (
    <>
      <SearchBar />
      {details && <AnimeCard details={details} />}
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
