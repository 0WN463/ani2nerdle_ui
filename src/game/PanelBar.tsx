import { useEffect, useRef, useState, ReactNode } from "react";
import { GameState, Linkage } from "./types";
import { ConcreteLink, CharacterDetail, VoiceActorDetails } from "./VoiceActor";
import { socket } from "../lib/socket";

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

const ShowCast = ({
  linkages,
  amt,
  onPowerUsed,
  enabled,
}: {
  linkages: Linkage[];
  amt: number;
  onPowerUsed: () => void;
  enabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  const mainLinkages = linkages.filter((l) => l.role === "Main");

  const onClick = () => {
    if (!used) onPowerUsed();

    setOpen(true);
    setUsed(true);
  };

  return (
    <>
      <button
        className="px-2 rounded-full bg-emerald-500 disabled:bg-emerald-200 disabled:text-gray-300 relative"
        onClick={onClick}
        disabled={amt === 0 || !enabled}
      >
        Show cast
        {amt > 0 && amt !== Infinity && (
          <div className="rounded-full absolute right-1 top-4 h-6 w-6 text-center border-2 bg-emerald-100 flex items-center justify-center">
            {amt}
          </div>
        )}
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

const Pass = ({
  amt,
  onPowerUsed,
  enabled,
}: {
  amt: number;
  onPowerUsed: () => void;
  enabled: boolean;
}) => {
  const onPowerUsedFunc = () => {
    socket.emit("pass");
    onPowerUsed();
  };

  return (
    <button
      className="px-2 rounded-full bg-emerald-500 disabled:bg-emerald-200 disabled:text-gray-300 relative"
      onClick={onPowerUsedFunc}
      disabled={amt === 0 || !enabled}
    >
      Pass
      {amt > 0 && amt !== Infinity && (
        <div className="rounded-full absolute right-1 top-4 h-6 w-6 text-center border-2 bg-emerald-100 flex items-center justify-center">
          {amt}
        </div>
      )}
    </button>
  );
};

export type PowerAmount = {
  cast: number;
  pass: number;
};

const Panel = ({
  className,
  data,
  activeLinkage,
  powerAmt,
  onPowerUsed,
  hasPass,
  powerEnabled,
}: {
  className?: string;
  data: Data;
  activeLinkage: Linkage[];
  powerAmt: PowerAmount;
  onPowerUsed: (type: keyof PowerAmount) => void;
  hasPass: boolean;
  powerEnabled: boolean;
}) => (
  <div className={`flex ${className}`}>
    <Stats data={data} />
    <ShowCast
      key={data.state.animes[0]}
      linkages={activeLinkage}
      amt={powerAmt.cast}
      onPowerUsed={() => onPowerUsed("cast")}
      enabled={powerEnabled}
    />
    {hasPass && (
      <Pass
        amt={powerAmt.pass}
        onPowerUsed={() => onPowerUsed("pass")}
        enabled={powerEnabled}
      />
    )}
  </div>
);

export default Panel;
