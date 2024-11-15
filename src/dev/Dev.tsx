import { VoiceActor } from "../game/VoiceActor";
import { Routes, Route } from "react-router";

const VoiceActorIndividual = () => {
  const limit3 = [1, 2, 3, 4].map((i) => (
    <VoiceActor
      linkLimit={3}
      concreteLink={{
        numUsed: i,
        id: 1,
        name: `Voice actor ${i}/3`,
        link: {
          from: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
          to: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
        },
      }}
    />
  ));

  const limit1 = [1, 2].map((i) => (
    <VoiceActor
      linkLimit={1}
      concreteLink={{
        numUsed: i,
        id: 1,
        name: `Voice actor ${i}/1`,
        link: {
          from: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
          to: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
        },
      }}
    />
  ));

  const unlimited = [1, 2, 3].map((i) => (
    <VoiceActor
      linkLimit={Infinity}
      concreteLink={{
        numUsed: i,
        id: 1,
        name: `Voice actor ${i}`,
        link: {
          from: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
          to: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
          ],
        },
      }}
    />
  ));

  return (
    <>
      {[limit3, limit1, unlimited].map((vas) => (
        <div
          style={{
            display: "flex",
            gap: "5em",
            justifyContent: "space-around",
          }}
        >
          {vas}
        </div>
      ))}
    </>
  );
};

const Playground = () => (
  <Routes>
    <Route path="/voice_actor" element={<VoiceActorIndividual />} />
  </Routes>
);

export default Playground;
