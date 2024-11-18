import { useEffect, useRef, useState, ReactNode } from "react";
import { GameState, Linkage } from "./types";
import { ConcreteLink, CharacterDetail, VoiceActorDetails } from "./VoiceActor";

const Modal = ({
  openModal,
  closeModal,
  children,
  className,
}: {
  openModal: boolean;
  closeModal: () => void;
  children?: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (openModal) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [openModal]);

  return (
    <dialog
      ref={ref}
      onCancel={closeModal}
      className={`rounded-lg p-4 ${className}`}
    >
      <div className="grid grid-cols-1 gap-2">
        {children}

        <button className="mx-auto" onClick={closeModal}>
          Close
        </button>
      </div>
    </dialog>
  );
};

type Data = { state: GameState; linkages: Omit<ConcreteLink, "numUsed">[][] };

const Stats = ({ data }: { data: Data }) => {
  const [open, setOpen] = useState(false);
  const numAnimes = data.state.animes.length;

  const count = <T,>(arr: T[], element: T) =>
    arr.filter((e) => e === element).length;
  const maxBy = <T, U>(arr: T[], fn: (_: T) => U) =>
    arr.reduce((acc, v) => (fn(v) > fn(acc) ? v : acc), arr[0]);

  const linkIds = data.linkages.flat().map((l) => l.id);
  const mostUsedLink = maxBy(
    [...new Set(linkIds)].map((id) => ({ count: count(linkIds, id), id })),
    (e) => e.count,
  );

  const linkDetails = (id: number, count: number) => (
    <>
      <h1 className="text-lg font-bold">Most used voice actor</h1>
      <div>Name: {data.linkages.flat().find((l) => l.id === id)?.name}</div>
      <div>Number of time used: {count}</div>
    </>
  );

  return (
    <>
      <button
        className="px-2 rounded-full bg-slate-300"
        onClick={() => setOpen(true)}
      >
        Stats
      </button>
      <Modal
        openModal={open}
        closeModal={() => setOpen(false)}
        className="w-4/5 lg:w-1/2"
        children={
          <>
            <div className="row-span-2">Number of animes: {numAnimes}</div>
            {mostUsedLink && linkDetails(mostUsedLink.id, mostUsedLink.count)}
          </>
        }
      />
    </>
  );
};

const ShowCast = ({ linkages }: { linkages: Linkage[] }) => {
  const [open, setOpen] = useState(false);
  const mainLinkages = linkages.filter((l) => l.role === "Main");

  return (
    <>
      <button
        className="px-2 rounded-full bg-slate-300"
        onClick={() => setOpen(true)}
      >
        Show cast
      </button>
      <Modal
        openModal={open}
        closeModal={() => setOpen(false)}
        className="w-4/5 lg:w-1/2"
        children={
          <>
            {mainLinkages.map((l) => (
              <div className="text-sm flex justify-around">
                <CharacterDetail
                  imageAnchor="top"
                  name={l.chara_name}
                  image_url={l.chara_img_url ?? ""}
                />
                <VoiceActorDetails name={l.name} image_url={l.image_url} />
              </div>
            ))}
          </>
        }
      />
    </>
  );
};

const Panel = ({
  className,
  data,
  activeLinkage,
}: {
  className?: string;
  data: Data;
  activeLinkage: Linkage[];
}) => (
  <div className={`flex ${className}`}>
    <Stats data={data} />
    <ShowCast linkages={activeLinkage} />
  </div>
);

export default Panel;
