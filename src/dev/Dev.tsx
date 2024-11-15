import { VoiceActor } from "../game/VoiceActor";

const Playground = () => (
  <div style={{ display: "flex", gap: "5em", justifyContent: "space-around" }}>
    <VoiceActor
      linkLimit={3}
      concreteLink={{
        numUsed: 1,
        id: 1,
        name: "Voice actor 1/3",
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
    <VoiceActor
      linkLimit={1}
      concreteLink={{
        numUsed: 1,
        id: 1,
        name: "Voice actor 1/1",
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
    <VoiceActor
      linkLimit={3}
      concreteLink={{
        numUsed: 2,
        id: 1,
        name: "Voice actor 2/3",
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
              image_url: "",
            },
          ],
        },
      }}
    />
    <VoiceActor
      linkLimit={3}
      concreteLink={{
        numUsed: 3,
        id: 1,
        name: "Voice actor 3/3",
        link: {
          from: [
            {
              name: "First character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/11/556642.webp?s=ada28fd15a950dfccfc37d41aaea8870",
            },
            {
              name: "Second character",
              image_url:
                "https://cdn.myanimelist.net/images/characters/5/464903.webp?s=8a4c1a500e00fe55746dd8d259401513",
            },
          ],
          to: [
            {
              name: "First character",
              image_url: "",
            },
          ],
        },
      }}
    />
    <VoiceActor
      linkLimit={Infinity}
      concreteLink={{
        numUsed: 3,
        id: 1,
        name: "Voice actor 3/unlimited",
        link: {
          from: [
            {
              name: "First character",
              image_url: "",
            },
            {
              name: "Second character",
              image_url: "",
            },
          ],
          to: [
            {
              name: "First character",
              image_url: "",
            },
            {
              name: "Second character",
              image_url: "",
            },
          ],
        },
      }}
    />
  </div>
);

export default Playground;
