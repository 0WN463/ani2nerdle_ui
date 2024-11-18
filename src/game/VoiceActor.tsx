import { useState } from "react";

type Character = {
  name: string;
  image_url: string;
};

export type ConcreteLink = {
  id: number;
  name: string;
  image_url?: string;
  link: { from: Character[]; to: Character[] };
  numUsed: number;
};

export const CharacterDetail = ({
  name,
  image_url,
  imageAnchor,
}: Character & { imageAnchor: "top" | "bottom" }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      id={name}
      className="whitespace-nowrap relative rounded-full border px-4 mx-1"
      onMouseOver={() => setOpen(true)}
      onMouseOut={() => setOpen(false)}
    >
      {name}
      {open && (
        <img
          src={image_url}
          className={`z-10 max-w-none w-20 absolute left-full ${imageAnchor === "top" ? "top-0" : "bottom-0"}`}
        />
      )}
    </span>
  );
};

export const VoiceActorDetails = ({
  name,
  image_url,
}: {
  name: string;
  image_url?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="whitespace-nowrap relative"
      onMouseOver={() => setOpen(true)}
      onMouseOut={() => setOpen(false)}
    >
      {name}
      {open && (
        <img
          src={image_url}
          className={`z-10 max-w-none w-20 absolute mx-2 left-full -translate-y-1/2`}
        />
      )}
    </span>
  );
};

export const VoiceActor = ({
  concreteLink,
  linkLimit,
}: {
  concreteLink: ConcreteLink;
  linkLimit: number;
}) => (
  <div
    className={`flex
  flex-col content-center
  items-center
  rounded-lg
  px-4
  py-2
  gap-12
  bg-[url('/src/game/chain-svgrepo-com.svg')]
  bg-no-repeat
  bg-center
  bg-[length:6em]
  bg-sky-300
  ${concreteLink.numUsed > linkLimit && "opacity-60"}
  `}
  >
    <div>
      {concreteLink.link.to.map((c) => (
        <CharacterDetail {...{ imageAnchor: "top", ...c }} />
      ))}
    </div>
    <VoiceActorDetails
      name={concreteLink.name}
      image_url={concreteLink.image_url}
    />
    {linkLimit !== Infinity && (
      <div
        className={`-my-9 px-2 rounded-full ${concreteLink.numUsed >= linkLimit && "bg-yellow-300"}`}
      >
        {"❌".repeat(Math.min(concreteLink.numUsed, linkLimit))}
      </div>
    )}
    <div>
      {concreteLink.link.from.map((c) => (
        <CharacterDetail {...{ imageAnchor: "bottom", ...c }} />
      ))}
    </div>
  </div>
);

const stableSort = <T,>(arr: T[], fn: (_a: T, _b: T) => number) => {
  return arr
    .map((e, i) => ({ ...e, index: i }))
    .sort((a, b) => (fn(a, b) !== 0 ? fn(a, b) : a.index - b.index));
};

const VoiceActors = ({
  links,
  linkLimit,
}: {
  links: ConcreteLink[];
  linkLimit: number;
}) => {
  const sorted = stableSort(links, (a, b) => {
    if (a.numUsed === linkLimit) return -1;
    if (b.numUsed === linkLimit) return 1;

    if (a.numUsed > linkLimit) return 1;
    if (b.numUsed > linkLimit) return -1;

    return 0;
  });

  return (
    <div className="flex gap-12 max-w-full overflow-x-auto px-24">
      {sorted.map((l) => (
        <VoiceActor concreteLink={l} linkLimit={linkLimit} />
      ))}
    </div>
  );
};

export { VoiceActors };
