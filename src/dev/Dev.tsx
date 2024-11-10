import { VoiceActor } from "../game/VoiceActor";

const Playground = () => (
  <div style={{ display: "flex", gap: "5em", justifyContent: "space-around" }}>
    <VoiceActor
      concreteLink={{
        id: 1,
        name: "Voice actor name",
        link: {
          from: [
            {
              name: "First character",
              image_url: "",
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
      concreteLink={{
        id: 1,
        name: "Voice actor name",
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
          ],
        },
      }}
    />
    <VoiceActor
      concreteLink={{
        id: 1,
        name: "Voice actor name",
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
