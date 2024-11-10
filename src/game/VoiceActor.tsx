import chain from "./chain-svgrepo-com.svg";

type Character = {
  name: string;
  image_url: string;
};

export type ConcreteLink = {
  id: number;
  name: string;
  link: { from: Character[]; to: Character[] };
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
        <span id={c.name} style={{ margin: "1em", whiteSpace: "nowrap" }}>
          {c.name}
        </span>
      ))}
    </div>
    <div style={{ whiteSpace: "nowrap" }}> {concreteLink.name} </div>
    <div>
      {concreteLink.link.from.map((c) => (
        <span id={c.name} style={{ margin: "1em", whiteSpace: "nowrap" }}>
          {c.name}
        </span>
      ))}
    </div>
  </div>
);

const VoiceActors = ({ links }: { links: ConcreteLink[] }) => (
  <div
    style={{
      display: "flex",
      gap: "4em",
      maxWidth: "100%",
      overflow: "scroll",
    }}
  >
    {links.map((l) => (
      <VoiceActor concreteLink={l} />
    ))}
  </div>
);

export { VoiceActors };
