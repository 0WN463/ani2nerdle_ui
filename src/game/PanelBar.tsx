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
      <PowerButton enabled={enabled} amt={amt} onClick={onClick} text="Cast" />
      <Modal
        openModal={open}
        closeModal={() => setOpen(false)}
        className="w-4/5 lg:w-1/2"
        children={mainLinkages.map((l) => (
          <div key={l.id} className="text-sm flex justify-around">
            <CharacterDetail
              imageAnchor="top"
              name={l.chara_name}
              image_url={l.chara_img_url ?? ""}
            />
            <VoiceActorDetails name={l.name} image_url={l.image_url} />
          </div>
        ))}
      />
    </>
  );
};

const PowerButton = ({
  text,
  amt,
  onClick,
  enabled,
}: {
  text: string;
  amt: number;
  onClick: () => void;
  enabled: boolean;
}) => {
  return (
    <button
      className="px-2 rounded-full bg-emerald-500 disabled:bg-emerald-200 disabled:text-gray-300 relative"
      onClick={onClick}
      disabled={amt === 0 || !enabled}
    >
      {text}
      {amt > 0 && amt !== Infinity && (
        <div className="rounded-full absolute right-1 top-4 h-6 w-6 text-center border-2 bg-emerald-100 flex items-center justify-center">
          {amt}
        </div>
      )}
    </button>
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
    <PowerButton
      enabled={enabled}
      amt={amt}
      onClick={onPowerUsedFunc}
      text="Pass"
    />
  );
};

const ExtendSolo = ({
  amt,
  onPowerUsed,
  enabled,
}: {
  amt: number;
  onPowerUsed: () => void;
  enabled: boolean;
}) => {
  return (
    <PowerButton
      enabled={enabled}
      amt={amt}
      onClick={onPowerUsed}
      text="Extend"
    />
  );
};

const ExtendMulti = ({
  amt,
  onPowerUsed,
  enabled,
}: {
  amt: number;
  onPowerUsed: () => void;
  enabled: boolean;
}) => {
  const onPowerUsedFunc = () => {
    socket.emit("extend");
    onPowerUsed();
  };

  return (
    <PowerButton
      enabled={enabled}
      amt={amt}
      onClick={onPowerUsedFunc}
      text="Extend"
    />
  );
};

export type PowerAmount = {
  cast: number;
  pass: number;
  extend: number;
};

const SinglePlayerPanel = ({
  className,
  data,
  activeLinkage,
  powerAmt,
  onPowerUsed,
}: {
  className?: string;
  data: Data;
  activeLinkage: Linkage[];
  powerAmt: PowerAmount;
  onPowerUsed: (type: keyof PowerAmount) => void;
}) => (
  <div className={`flex gap-2 ${className}`}>
    <Stats data={data} />
    <ShowCast
      key={data.state.animes[0]}
      linkages={activeLinkage}
      amt={powerAmt.cast}
      onPowerUsed={() => onPowerUsed("cast")}
      enabled
    />
    <ExtendSolo
      amt={powerAmt.extend}
      onPowerUsed={() => onPowerUsed("extend")}
      enabled
    />
  </div>
);

const MultiplayerPanel = ({
  className,
  data,
  activeLinkage,
  powerAmt,
  onPowerUsed,
  powerEnabled,
}: {
  className?: string;
  data: Data;
  activeLinkage: Linkage[];
  powerAmt: PowerAmount;
  onPowerUsed: (type: keyof PowerAmount) => void;
  powerEnabled: boolean;
}) => (
  <div className={`flex gap-2 ${className}`}>
    <Stats data={data} />
    <ShowCast
      key={data.state.animes[0]}
      linkages={activeLinkage}
      amt={powerAmt.cast}
      onPowerUsed={() => onPowerUsed("cast")}
      enabled={powerEnabled}
    />
    <Pass
      amt={powerAmt.pass}
      onPowerUsed={() => onPowerUsed("pass")}
      enabled={powerEnabled}
    />
    <ExtendMulti
      amt={powerAmt.extend}
      onPowerUsed={() => onPowerUsed("extend")}
      enabled={powerEnabled}
    />
  </div>
);

export { MultiplayerPanel, SinglePlayerPanel };
