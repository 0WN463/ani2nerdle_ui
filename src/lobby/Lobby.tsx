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

const SearchBar = ({ onSelect }: { onSelect: (id: number) => void }) => {
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
        onChange={(e: any) => onSelect(e.value)}
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

const AnimeCard = ({ id }: { id: number }) => {
  const { isLoading, data: details } = useAnimeDetails(id);
  if (isLoading || !details) return <div>Loading...</div>;

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

const useLinkages = (animeId?: number) => {
  return useQuery({
    enabled: !!animeId,
    queryKey: ["animeLinkages", animeId],
    queryFn: async () => {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime/${animeId}/characters`,
      );
      const res = await response.json();

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

      return res?.data?.map(charaToLinkage).filter((l?: Linkage) => l);
    },
  });
};

const useGameState = (id: number) => {
  const [state, setState] = useState<GameState>({ animes: [{ id }] });
  const { data: linkages } = useLinkages(state.animes[0].id);

  const addNextAnime = (id: number) => {
    setState({ animes: [{ id }, ...state.animes] });
  };

  return { state, linkages, addNextAnime };
};

const useAnimeDetails = (id: number) =>
  useQuery({
    queryKey: ["animeDetails", id],
    queryFn: async () => {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      const res = await response.json();

      return {
        id,
        title: res?.data?.title,
        title_english: res?.data?.title_english,
        imageUrl: res?.data?.images?.webp?.image_url,
      } as AnimeDetails;
    },
  });

const Game = ({ id: firstAnime }: { id: number }) => {
  const [selectedAnime, setSelectedAnime] = useState<number>();
  const { linkages, addNextAnime, state } = useGameState(firstAnime);
  const { data: candidateLinkages } = useLinkages(selectedAnime);

  useEffect(() => {
    const onNextAnime = (id: number) => {
      addNextAnime(id);
    };

    socket.on("next anime", onNextAnime);

    return () => {
      socket.off("next anime", onNextAnime);
    };
  });

  useEffect(() => {
    if (!candidateLinkages) return;

    const linkageIds = toIds(linkages);
    const candidateIds = toIds(candidateLinkages);
    const validLinkages = linkageIds?.filter((id) =>
      candidateIds?.includes(id),
    );

    console.log(
      validLinkages.map(
        (id) =>
          `${linkages.find((l: Linkage) => l.id === id).chara_name} <-> ${candidateLinkages.find((l: Linkage) => l.id === id).chara_name}`,
      ),
    );

    if (validLinkages.length) socket.emit("send anime", selectedAnime);

    setSelectedAnime(undefined);
  }, [selectedAnime, linkages, candidateLinkages]);

  const toIds = (arr: any[]) => arr?.map((e) => e.id);

  const onAnimeSelect = (id: number) => {
    setSelectedAnime(id);
  };

  console.log(state);
  console.log(linkages);

  return (
    <>
      <SearchBar onSelect={onAnimeSelect} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {state.animes.map((a) => (
          <AnimeCard key={a.id} id={a.id} />
        ))}
      </div>
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
