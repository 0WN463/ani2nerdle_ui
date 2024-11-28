import { VoiceActors, ConcreteLink } from "./VoiceActor";
import AnimeCard from "./AnimeCard";

type Anime = {
  type: "anime";
  id: number;
};

type Links = {
  type: "links";
  links: Omit<ConcreteLink, "numUsed">[];
};

type StackProps = (Anime | Links)[];

const Stack = ({
  data,
  linkLimit,
}: {
  data: StackProps;
  linkLimit: number;
}) => {
  const links = data.filter((_, i) => i % 2 === 1) as Links[];

  const augmentOccurrences = (
    arr: Omit<ConcreteLink, "numUsed">[][],
  ): ConcreteLink[][] =>
    arr.reduce((acc, subArray) => {
      const countMap = acc.flat().reduce(
        (map, { id }) => {
          map[id] = (map[id] ?? 0) + 1;
          return map;
        },
        {} as Record<number, number>,
      );

      const augmentedSubArray = subArray.map((value) => ({
        ...value,
        numUsed: (countMap[value.id] || 0) + 1,
      }));

      return [...acc, augmentedSubArray];
    }, [] as ConcreteLink[][]);

  const result = augmentOccurrences(
    links.map((l) => l.links).reverse(),
  ).reverse();

  return (
    <div className="flex flex-col items-center gap-6">
      {data.map((e, i) =>
        e.type === "anime" ? (
          <AnimeCard key={`anime-${e.id}`} id={e.id} />
        ) : (
          <VoiceActors
            key={`va-${(data[i - 1] as Anime).id}`}
            links={result[(i - 1) / 2]}
            linkLimit={linkLimit}
          />
        ),
      )}
    </div>
  );
};

export default Stack;
