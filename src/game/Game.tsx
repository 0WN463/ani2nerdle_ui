import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { socket } from "../lib/socket";
import { nanoid } from "nanoid";
import Lobby from "../lobby/Lobby";
import Stack from "./Stack";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "./SearchBar";
import { PowerAmount, MultiplayerPanel, SinglePlayerPanel } from "./PanelBar";
import { GameState, Linkage } from "./types";

type Stage = { type: "lobby" } | { type: "game"; animeId: number; ts: number };

const Game = ({
  id: firstAnime,
  startsFirst,
  initialTs,
}: {
  id: number;
  startsFirst: boolean;
  initialTs: number;
}) => {
  const config = useConfig();

  const [selectedAnime, setSelectedAnime] = useState<number>();
  const {
    activeLinkage,
    addNextAnime,
    state,
    linkages,
    powerAmt,
    consumePower,
  } = useGameState(firstAnime);

  const [timerTs, setTimerTs] = useState(initialTs);
  const [isActive, setActive] = useState(startsFirst);
  const { data: candidateLinkages } = useLinkage(
    config.language,
    selectedAnime,
  );
  const [isGameover, setGameOver] = useState(false);

  useEffect(() => {
    const onNextAnime = (id: number, ts: number) => {
      addNextAnime(id);
      setTimerTs(ts);
      setActive(!isActive);
    };

    socket.on("next anime", onNextAnime);

    return () => {
      socket.off("next anime", onNextAnime);
    };
  }, [isActive, addNextAnime]);

  useEffect(() => {
    const onPass = (ts: number) => {
      setTimerTs(ts);
      setActive(!isActive);
    };

    socket.on("pass", onPass);

    return () => {
      socket.off("pass", onPass);
    };
  }, [isActive]);

  useEffect(() => {
    const onExtend = () => {
      setTimerTs(timerTs + 10);
    };

    socket.on("extend", onExtend);

    return () => {
      socket.off("extend", onExtend);
    };
  }, [timerTs]);

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
        <TimestampedTimer
          className="flex justify-center"
          key={`${state.animes[0]}-${isActive}`}
          timeLimit={config.timeLimit}
          onTimeout={() => setGameOver(true)}
          ts={timerTs}
        />
      )}
      <SearchBar
        onSelect={setSelectedAnime}
        isDisabled={(id) => state.animes.includes(id)}
        className="mx-4 my-2"
        disabled={isGameover || !isActive}
      />
      <Stack data={data} linkLimit={Infinity} />
      <Toaster />
      <MultiplayerPanel
        className="fixed bottom-4 right-4"
        data={{ linkages, state }}
        activeLinkage={activeLinkage ?? []}
        powerAmt={powerAmt}
        onPowerUsed={consumePower}
        powerEnabled={isActive}
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

const TimestampedTimer = ({
  timeLimit,
  className,
  onTimeout,
  ts,
}: {
  timeLimit: number;
  className?: string;
  onTimeout: () => void;
  ts: number;
}) => {
  const [time, setTime] = useState(Date.now());

  const timeElapsed = time - ts * 1000;

  const timeLeft = timeLimit * 1000 - timeElapsed;

  useEffect(() => {
    const syncTimer = () => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        onTimeout();
      }

      setTime(Date.now());
    };

    const interval = setInterval(syncTimer, 100);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeout]);

  const content =
    timeLeft > 0
      ? (timeLeft / 1000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        })
      : "Time's up!";

  return <div className={`font-bold ${className}`}>{content}</div>;
};

const Timer = ({
  timeLimit,
  className,
  bonusTime,
  onTimeout,
}: {
  timeLimit: number;
  bonusTime: number;
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

  const timeLeft = bonusTime * 10 + time;

  if (timeLeft <= 0) {
    onTimeout();
  }

  const content =
    timeLeft > 0
      ? (timeLeft / 10).toLocaleString(undefined, {
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
  const timeLimit = applyIf(parseParam, searchParams.get("time")) ?? 30;
  const extensionLimit =
    applyIf(parseParam, searchParams.get("extension")) ?? 1;

  const language = searchParams.get("language") ?? "Japanese";

  return { linkLimit, castLimit, timeLimit, extensionLimit, language };
};

const GameSolo = ({ firstAnime }: { firstAnime: number }) => {
  const config = useConfig();

  const [selectedAnime, setSelectedAnime] = useState<number>();
  const [bonusTime, setBonusTime] = useState(0);
  const [isGameover, setGameOver] = useState(false);
  const {
    activeLinkage,
    addNextAnime,
    state,
    linkages,
    linkUsages,
    powerAmt,
    consumePower,
  } = useGameState(firstAnime);

  const { data: candidateLinkages } = useLinkage(
    config.language,
    selectedAnime,
  );

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
      setBonusTime(0);
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

  const onUsePower = (type: "cast" | "extend" | "pass") => {
    if (type === "extend") setBonusTime(bonusTime + 10);

    consumePower(type);
  };

  return (
    <>
      {config.timeLimit !== Infinity && (
        <Timer
          className="flex justify-center"
          key={state.animes[0]}
          timeLimit={config.timeLimit}
          onTimeout={() => setGameOver(true)}
          bonusTime={bonusTime}
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
      <SinglePlayerPanel
        className="fixed bottom-4 right-4"
        data={{ linkages, state }}
        activeLinkage={activeLinkage ?? []}
        powerAmt={powerAmt}
        onPowerUsed={onUsePower}
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

      type topAnimeResponse = {
        data: { mal_id: number }[];
      };

      const res = (await response.json()) as topAnimeResponse;
      const animeIds = res.data.map((a) => a.mal_id);

      return animeIds[Math.floor(Math.random() * animeIds.length)];
    },
    staleTime: 0,
  });
};

const fetchFn = (language: string, animeId?: number) => async () => {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/characters`,
  );
  const res = (await response.json()) as CharactersResponse;

  type CharactersResponse = {
    data: {
      character: {
        name: string;
        images: { webp: { image_url: string } };
      };
      voice_actors: {
        person: {
          name: string;
          mal_id: number;
          images: { jpg: { image_url: string } };
        };
        language: string;
      }[];
      role: "Main" | "Supporting";
    }[];
  };

  const charaToLinkage = (data: CharactersResponse["data"][0]) => {
    const japVas = data.voice_actors.filter(
      (role) => role.language === language,
    );

    return japVas?.map((japVa) => ({
      name: japVa.person.name,
      id: japVa.person.mal_id,
      image_url: japVa.person.images?.jpg?.image_url,
      chara_name: data.character.name,
      chara_img_url: data.character.images.webp.image_url,
      role: data.role,
    }));
  };

  return res.data.flatMap(charaToLinkage).filter((l) => l) as Linkage[];
};

const useLinkage = (language: string, animeId?: number) => {
  return useQuery({
    enabled: !!animeId,
    queryKey: ["animeLinkages", animeId],
    queryFn: fetchFn(language, animeId),
  });
};

const useLinkages = (language: string, animeIds: number[]) => {
  return useQueries({
    queries: animeIds.map((animeId) => ({
      queryKey: ["animeLinkages", animeId],
      enabled: !!animeId,
      queryFn: fetchFn(language, animeId),
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
    pass: 1,
    extend: config.extensionLimit,
  });

  const consumePower = (type: "cast" | "pass" | "extend") =>
    setPowerAmt({ ...powerAmt, [type]: powerAmt[type] - 1 });

  const linkages = useLinkages(config.language, state.animes);
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
  const [isHost, setHost] = useState(false);
  const [stage, setStage] = useState<Stage>({ type: "lobby" });
  const playerId = nanoid();

  const onGameStart = (animeId: number, isHost: boolean, ts: number) => {
    setHost(isHost);
    setStage({ type: "game", animeId, ts });
  };

  if (!id) {
    return "Invalid game id";
  }

  const game =
    stage.type === "lobby" ? (
      <Lobby id={id} onGameStarted={onGameStart} playerId={playerId} />
    ) : (
      <>
        <Game id={stage.animeId} startsFirst={isHost} initialTs={stage.ts} />
      </>
    );

  return game;
};

export default Page;
