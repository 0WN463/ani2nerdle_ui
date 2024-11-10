type Character = {
  name: string;
  image_url: string;
};

export type ConcreteLink = {
  id: number;
  name: string;
  link: { from: Character[]; to: Character[] };
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

export {VoiceActors};
