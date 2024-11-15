import chain from "./chain-svgrepo-com.svg";

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

const CharacterDetail = ({
  name,
  image_url,
  imageAnchor,
}: Character & { imageAnchor: "top" | "bottom" }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      id={name}
      style={{ margin: "1em", whiteSpace: "nowrap", position: "relative" }}
      onMouseOver={() => setOpen(true)}
      onMouseOut={() => setOpen(false)}
    >
      {name}
      {open && (
        <img
          src={image_url}
          style={{
            width: "5em",
            position: "absolute",
            zIndex: "1",
            ...(imageAnchor === "top" ? { top: 0 } : { bottom: 0 }),
          }}
        />
      )}
    </span>
  );
};

const VoiceActorDetails = ({
  name,
  image_url,
}: {
  name: string;
  image_url?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ whiteSpace: "nowrap", position: "relative" }}
      onMouseOver={() => setOpen(true)}
      onMouseOut={() => setOpen(false)}
    >
      {name}
      {open && (
        <img
          src={image_url}
          style={{
            width: "5em",
            position: "absolute",
            zIndex: "1",
            transform: "translateY(-50%)",
          }}
        />
      )}
    </div>
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
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#6CB4EE",
      borderRadius: "1em",
      padding: "0.4em",
      gap: "3em",
      backgroundImage: `url(${chain})`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "6em",
      opacity: concreteLink.numUsed > linkLimit ? 0.8 : 1,
    }}
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
        style={{
          margin: "-2em",
          padding: "0 0.5em",
          background: concreteLink.numUsed >= linkLimit ? "gold" : "none",
          borderRadius: "1em",
        }}
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

const VoiceActors = ({
  links,
  linkLimit,
}: {
  links: ConcreteLink[];
  linkLimit: number;
}) => (
  <div
    style={{
      display: "flex",
      gap: "4em",
      maxWidth: "60%",
      overflowX: "auto",
      padding: "0 20%",
    }}
  >
    {links.map((l) => (
      <VoiceActor concreteLink={l} linkLimit={linkLimit} />
    ))}
  </div>
);

export { VoiceActors };
