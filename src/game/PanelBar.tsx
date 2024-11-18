import { useEffect, useRef, useState, ReactNode } from "react";
import { GameState } from "./types";
import { ConcreteLink } from "./VoiceActor";

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
      <div className="grid grid-rows-8 grid-cols-1 gap-2">
        {children}

        <button className="mx-auto -row-end-1" onClick={closeModal}>
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
        className="w-1/2"
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

const Panel = ({ className, data }: { className?: string; data: Data }) => (
  <div className={className}>
    <Stats data={data} />
  </div>
);

export default Panel;
