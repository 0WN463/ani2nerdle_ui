import chain from "./chain-svgrepo-com.svg";

import { useState } from "react";

type Character = {
  name: string;
  image_url: string;
};

export type ConcreteLink = {
  id: number;
  name: string;
  link: { from: Character[]; to: Character[] };
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

export const VoiceActor = ({
  concreteLink,
}: {
  concreteLink: ConcreteLink;
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
    }}
  >
    <div>
      {concreteLink.link.to.map((c) => (
        <CharacterDetail {...{ imageAnchor: "top", ...c }} />
      ))}
    </div>
    <div style={{ whiteSpace: "nowrap" }}> {concreteLink.name} </div>
    <div>
      {concreteLink.link.from.map((c) => (
        <CharacterDetail {...{ imageAnchor: "bottom", ...c }} />
      ))}
    </div>
  </div>
);

const VoiceActors = ({ links }: { links: ConcreteLink[] }) => (
  <div
    style={{
      display: "flex",
      gap: "4em",
      maxWidth: "60%",
      overflowX: "scroll",
      padding: "0 40%",
    }}
  >
    {links.map((l) => (
      <VoiceActor concreteLink={l} />
    ))}
  </div>
);

export { VoiceActors };
