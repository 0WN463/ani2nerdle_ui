import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { socket } from "../lib/socket";
import { nanoid } from "nanoid";
import Lobby from "../lobby/Lobby";
import Select from "react-select";

type Stage = { type: "lobby" } | { type: "game"; animeId: number };

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
        `https://api.jikan.moe/v4/anime?q=${searchTerm}&sfw=true&order_by=popularity`,
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
      An error has occurred
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

const VoiceActors = ({ links }: { links: ConcreteLink[] }) => (
  <div style={{ display: "flex", gap: "4em" }}>
    {links.map((l) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>
          {l.link.to.map((c) => (
            <div id={c.name}>{c.name}</div>
          ))}
        </div>
        <div> {l.name} </div>
        <div>
          {l.link.from.map((c) => (
            <div id={c.name}>{c.name}</div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const Game = ({ id: firstAnime }: { id: number }) => {
  const [selectedAnime, setSelectedAnime] = useState<number>();
  const { activeLinkage, addNextAnime, state, linkages } =
    useGameState(firstAnime);
  const { data: candidateLinkages } = useLinkage(selectedAnime);

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

    const validLinkages = linkageIntersection(
      activeLinkage ?? [],
      candidateLinkages,
    );

    if (validLinkages.length) socket.emit("send anime", selectedAnime);

    setSelectedAnime(undefined);
  }, [selectedAnime, activeLinkage, candidateLinkages]);

  const data = interleave(
    state.animes.map((a) => ({ type: "anime" as const, id: a.id })),
    linkages.map((e) => ({ type: "links" as const, links: e })),
  );

  return (
    <>
      <SearchBar onSelect={setSelectedAnime} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {data.map((e) =>
          e.type === "anime" ? (
            <AnimeCard key={e.id} id={e.id} />
          ) : (
            <VoiceActors links={e.links} />
          ),
        )}
      </div>
    </>
  );
};

type Anime = {
  id: number;
};

type GameState = {
  animes: Anime[];
  linkages: number[];
};

type Linkage = {
  name: string;
  id: number;
  chara_name: string;
  chara_img_url?: string;
};

const useLinkage = (animeId?: number) => {
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

const useLinkages = (animeIds: number[]) => {
  return useQueries({
    queries: animeIds.map((animeId) => ({
      queryKey: ["animeLinkages", animeId],
      enabled: !!animeId,
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

        return res?.data
          ?.map(charaToLinkage)
          .filter((l?: Linkage) => l) as Linkage[];
      },
    })),
  });
};

const pairMap = <T, U>(arr: T[], func: (_a: T, _b: T) => U) =>
  [...Array(arr.length - 1)]
    .map((_, i) => i)
    .map((i) => func(arr[i], arr[i + 1]));

const useGameState = (id: number) => {
  const [state, setState] = useState<GameState>({
    animes: [{ id }],
    linkages: [],
  });
  const linkages = useLinkages(state.animes.map((a) => a.id));
  const usedLinkages = pairMap(
    linkages.map((l) => l.data ?? []),
    computeLinks,
  );

  const addNextAnime = (id: number) => {
    setState({ animes: [{ id }, ...state.animes], linkages: state.linkages });
  };

  const addLinkage = (linkage: number) => {
    setState({ animes: state.animes, linkages: [linkage, ...state.linkages] });
  };

  return {
    state,
    activeLinkage: linkages[0].data,
    addNextAnime,
    addLinkage,
    linkages: usedLinkages,
  };
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

type Character = {
  name: string;
  image_url: string;
};

type ConcreteLink = {
  id: number;
  name: string;
  link: { from: Character[]; to: Character[] };
};

const computeLinks = (to: Linkage[], from: Linkage[]) => {
  const ids = Array.from(
    new Set(
      intersection(
        from.map((l) => l.id),
        to.map((l) => l.id),
      ),
    ),
  );

  const linkToChar = (l: Linkage) => ({
    name: l.chara_name,
    image_url: l.chara_img_url,
  });

  return ids.map(
    (id) =>
      ({
        id,
        name: (from.find((l) => l.id === id) as Linkage).name,
        link: {
          from: from.filter((l) => l.id === id).map(linkToChar),
          to: to.filter((l) => l.id === id).map(linkToChar),
        },
      }) as ConcreteLink,
  );
};
const intersection = <T,>(a: T[], b: T[]) => a?.filter((e) => b?.includes(e));

const linkageIntersection = (from: Linkage[], to: Linkage[]) => {
  const toIds = (arr: Linkage[]) => arr?.map((e) => e.id);

  const linkageIds = toIds(from);
  const candidateIds = toIds(to);
  return linkageIds?.filter((id) => candidateIds?.includes(id));
};

const interleave = <T, U>(a: T[], b: U[]) => {
  const result: (U | T)[] = [];

  a.forEach((e, i) => {
    result.push(e);

    if (b[i] !== undefined) result.push(b[i]);
  });

  return result;
};

const Page = () => {
  const { id } = useParams();
  const [stage, setStage] = useState<Stage>({ type: "lobby" });

  const onGameStart = (animeId: number) => {
    setStage({ type: "game", animeId });
  };


  useEffect(() => {
    socket.emit("join_game", { game_id: id, player_id: nanoid() });
  }, [id]);



  const game =
    stage.type === "lobby" ? (
      <Lobby onGameStarted={onGameStart} />
    ) : (
      <>
        <div> game {id} </div>
        <Game id={stage.animeId} />
      </>
    );

  return game;
};

export default Page;
