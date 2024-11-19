import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { socket } from "../lib/socket";
import { nanoid } from "nanoid";
import Lobby from "../lobby/Lobby";
import Stack from "./Stack";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "./SearchBar";
import PanelBar, { PowerAmount } from "./PanelBar";
import { GameState, Linkage } from "./types";

type Stage = { type: "lobby" } | { type: "game"; animeId: number };

const Game = ({ id: firstAnime }: { id: number }) => {
  const [selectedAnime, setSelectedAnime] = useState<number>();
  const { activeLinkage, addNextAnime, state, linkages } =
    useGameState(firstAnime);
  const { data: candidateLinkages } = useLinkage(selectedAnime);
  const [isGameover, setGameOver] = useState(false);
  const config = useConfig();

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

    if (validLinkages.length) {
      toast.success("Linked!");
      socket.emit("send anime", selectedAnime);
    } else {
      toast.error("No links there");
    }
    setSelectedAnime(undefined);
  }, [selectedAnime, activeLinkage, candidateLinkages]);

  const data = interleave(
    state.animes.map((a) => ({ type: "anime" as const, id: a })),
    linkages.map((e) => ({ type: "links" as const, links: e })),
  );

  return (
    <>
      {config.timeLimit !== Infinity && (
        <Timer
          className="flex justify-center"
          key={state.animes[0]}
          timeLimit={config.timeLimit}
          onTimeout={() => setGameOver(true)}
        />
      )}
      <SearchBar
        onSelect={setSelectedAnime}
        isDisabled={(id) => state.animes.includes(id)}
        className="mx-4 my-2"
        disabled={isGameover}
      />
      <Stack data={data} linkLimit={Infinity} />
      <Toaster />
      <PanelBar
        className="fixed bottom-4 right-1/4"
        data={{ linkages, state }}
        activeLinkage={activeLinkage ?? []}
      />
    </>
  );
};

const GameSoloWrapper = () => {
  const { data: firstAnime } = useRandomPopularAnime();

  return firstAnime && <GameSolo firstAnime={firstAnime} />;
};

export { GameSoloWrapper as GameSolo };

const applyIf = <T, U>(fn: (_: T) => U, v: T | null) => (v ? fn(v) : null);

const parseParam = (s: string) => (s === "unlimited" ? Infinity : parseInt(s));

const Timer = ({
  timeLimit,
  className,
  onTimeout,
}: {
  timeLimit: number;
  className?: string;
  onTimeout: () => void;
}) => {
  const [time, setTime] = useState(timeLimit * 10);

  const decrementTimer = () => {
    setTime((t) => t - 1);
  };

  useEffect(() => {
    const interval = setInterval(decrementTimer, 100);

    return () => clearInterval(interval);
  }, []);

  if (time <= 0) {
    onTimeout();
  }

  const content =
    time > 0
      ? (time / 10).toLocaleString(undefined, {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        })
      : "Time's up!";

  return <div className={`font-bold ${className}`}>{content}</div>;
};

const useConfig = () => {
  const [searchParams] = useSearchParams();

  const linkLimit = applyIf(parseParam, searchParams.get("link")) ?? 3;
  const castLimit = applyIf(parseParam, searchParams.get("cast")) ?? 1;
  const timeLimit = applyIf(parseParam, searchParams.get("time")) ?? 20;

  return { linkLimit, castLimit, timeLimit };
};

const GameSolo = ({ firstAnime }: { firstAnime: number }) => {
  const [selectedAnime, setSelectedAnime] = useState<number>();
  const [isGameover, setGameOver] = useState(false);
  const { data: candidateLinkages } = useLinkage(selectedAnime);
  const config = useConfig();
  const {
    activeLinkage,
    addNextAnime,
    state,
    linkages,
    linkUsages,
    powerAmt,
    consumePower,
  } = useGameState(firstAnime);

  useEffect(() => {
    if (!candidateLinkages || !selectedAnime) return;

    const sharedLinks = linkageIntersection(
      activeLinkage ?? [],
      candidateLinkages,
    );

    const validLinkages = sharedLinks.filter(
      (l) => (linkUsages.get(l) ?? 0) < config.linkLimit,
    );

    if (validLinkages.length) {
      toast.success("Linked!");
      addNextAnime(selectedAnime);
    } else {
      if (sharedLinks.length === 0) {
        toast.error("No links there");
      } else {
        const names = [...new Set(sharedLinks)].map(
          (id) => activeLinkage?.find((al) => al.id === id)?.name,
        );

        toast.error(`All links striked out:\n\n${names.join("\n")}`);
      }
    }
    setSelectedAnime(undefined);
  }, [
    selectedAnime,
    activeLinkage,
    candidateLinkages,
    addNextAnime,
    linkUsages,
    config.linkLimit,
  ]);

  const data = interleave(
    state.animes.map((a) => ({ type: "anime" as const, id: a })),
    linkages.map((e) => ({ type: "links" as const, links: e })),
  );

  return (
    <>
      {config.timeLimit !== Infinity && (
        <Timer
          className="flex justify-center"
          key={state.animes[0]}
          timeLimit={config.timeLimit}
          onTimeout={() => setGameOver(true)}
        />
      )}
      <SearchBar
        onSelect={setSelectedAnime}
        isDisabled={(id) => state.animes.includes(id)}
        className="mx-4 my-2"
        disabled={isGameover}
      />
      <Stack data={data} linkLimit={config.linkLimit} />
      <Toaster />
      <PanelBar
        className="fixed bottom-4 right-4"
        data={{ linkages, state }}
        activeLinkage={activeLinkage ?? []}
        powerAmt={powerAmt}
        onPowerUsed={consumePower}
      />
    </>
  );
};

const useRandomPopularAnime = () => {
  return useQuery({
    queryKey: ["popularAnimes"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.jikan.moe/v4/top/anime?type=tv&filter=bypopularity",
      );
      const res = await response.json();
      const animeIds = res?.data?.map((a: any) => a.mal_id);

      return animeIds[Math.floor(Math.random() * animeIds.length)];
    },
    staleTime: 0,
  });
};

const fetchFn = (animeId?: number) => async () => {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/characters`,
  );
  const res = await response.json();

  const charaToLinkage = (data: any) => {
    const japVas = data.voice_actors.filter(
      (role: any) => role.language === "Japanese",
    );

    return japVas.map((japVa: any) => ({
      name: japVa.person.name,
      id: japVa.person.mal_id,
      image_url: japVa.person.images?.jpg?.image_url,
      chara_name: data.character.name,
      chara_img_url: data.character.images.webp.image_url,
      role: data.role,
    }));
  };

  return res?.data
    ?.flatMap(charaToLinkage)
    .filter((l?: Linkage) => l) as Linkage[];
};

const useLinkage = (animeId?: number) => {
  return useQuery({
    enabled: !!animeId,
    queryKey: ["animeLinkages", animeId],
    queryFn: fetchFn(animeId),
  });
};

const useLinkages = (animeIds: number[]) => {
  return useQueries({
    queries: animeIds.map((animeId) => ({
      queryKey: ["animeLinkages", animeId],
      enabled: !!animeId,
      queryFn: fetchFn(animeId),
    })),
  });
};

const pairMap = <T, U>(arr: T[], func: (_a: T, _b: T) => U) =>
  [...Array(arr.length - 1)]
    .map((_, i) => i)
    .map((i) => func(arr[i], arr[i + 1]));

const useGameState = (id: number) => {
  const config = useConfig();
  const [state, setState] = useState<GameState>({
    animes: [id],
  });

  const [powerAmt, setPowerAmt] = useState<PowerAmount>({
    cast: config.castLimit,
  });

  const consumePower = (type: "cast") =>
    setPowerAmt({ ...powerAmt, [type]: powerAmt[type] - 1 });

  const linkages = useLinkages(state.animes);
  const usedLinkages = pairMap(
    linkages.map((l) => l.data ?? []),
    computeLinks,
  );

  const addNextAnime = (id: number) => {
    setState({ animes: [id, ...state.animes] });
  };

  const linkUsages = usedLinkages
    .flat()
    .map((l) => l.id)
    .reduce((acc, v) => {
      acc.set(v, (acc.get(v) ?? 0) + 1);
      return acc;
    }, new Map<number, number>());

  return {
    state,
    activeLinkage: linkages[0].data,
    addNextAnime,
    linkages: usedLinkages,
    linkUsages,
    powerAmt,
    consumePower,
  };
};

const computeLinks = (to: Linkage[], from: Linkage[]) => {
  const createMap = (links: Linkage[]) => {
    const map = new Map();

    links.forEach((l) => {
      if (map.get(l.id)?.role === "Main") return;

      map.set(l.id, l);
    });

    return map;
  };
  const fromMap = createMap(from);
  const toMap = createMap(to);

  const ids = Array.from(
    new Set(
      intersection(
        from.map((l) => l.id),
        to.map((l) => l.id),
      ),
    ),
  );

  const toScore = (m: Map<number, Linkage>, id: number) =>
    m.get(id)?.role === "Main" ? 2 : 1;
  const totalScore = (id: number) => toScore(fromMap, id) + toScore(toMap, id);

  ids.sort((a, b) => totalScore(b) - totalScore(a));

  const linkToChar = (l: Linkage) => ({
    name: l.chara_name,
    image_url: l.chara_img_url ?? "",
  });

  return ids.map((id) => ({
    id,
    name: fromMap.get(id)?.name,
    image_url: fromMap.get(id)?.image_url,
    link: {
      from: from.filter((l) => l.id === id).map(linkToChar),
      to: to.filter((l) => l.id === id).map(linkToChar),
    },
  })); // TODO: sort by support/main role
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
        <Game id={stage.animeId} />
      </>
    );

  return game;
};

export default Page;
