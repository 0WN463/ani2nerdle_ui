import { VoiceActors, ConcreteLink } from "./VoiceActor";
import AnimeCard from "./AnimeCard";

type StackProps = ({
    type: "anime";
    id: number;
} | {
    type: "links";
    links: ConcreteLink[];
})[]

const Stack = ({data}: {data: StackProps}) => 
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

export default Stack
