import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";

type Limit = { type: "unlimited" } | { type: "limited"; amt: number };

const LimitOption = ({
  limit,
  onLimitChange,
  label,
  defaultValue,
}: {
  limit: Limit;
  onLimitChange: (_: Limit) => void;
  label: string;
  defaultValue: number;
}) => (
  <label className="flex gap-2 justify-around">
    {label}
    <span>
      <label>
        Unlimited
        <input
          className="mx-2"
          type="checkbox"
          checked={limit.type === "unlimited"}
          onChange={() =>
            onLimitChange(
              limit.type === "limited"
                ? { type: "unlimited" }
                : { type: "limited", amt: defaultValue },
            )
          }
        />
      </label>
      <input
        type="number"
        className="border border-gray-500 rounded w-10"
        value={limit.type === "limited" ? limit.amt : ""}
        disabled={limit.type !== "limited"}
        min={1}
        onChange={(v) =>
          onLimitChange({ type: "limited", amt: parseInt(v.target.value) })
        }
      />
    </span>
  </label>
);

type Config = {
  link: Limit;
  cast: Limit;
  time: Limit;
  extend: Limit;
};

const defaultConfig = {
  link: { type: "limited", amt: 3 },
  cast: { type: "limited", amt: 1 },
  time: { type: "limited", amt: 30 },
  extend: { type: "limited", amt: 1 },
} as const;

const Lobby = () => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  const [config, setConfig] = useState<Config>(defaultConfig);
  const navigate = useNavigate();

  const toParam = (l: Limit) =>
    l.type === "unlimited" ? "unlimited" : "" + l.amt;

  return (
    <div>
      <div className="flex flex-col gap-4 mx-10">
        <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
          <div className="text-3xl sm:text-6xl font-bold text-center mt-48">
            ANI2<span className="text-teal-400">NERDLE</span>
          </div>
        </header>
        <button
          className="text-3xl bg-sky-300 rounded mx-3 p-3"
          onClick={() =>
            navigate({
              pathname: "/solo/game",
              search: createSearchParams({
                link: toParam(config.link),
                cast: toParam(config.cast),
                time: toParam(config.time),
                extend: toParam(config.extend),
              }).toString(),
            })
          }
        >
          Start
        </button>
        <LimitOption
          limit={config.link}
          onLimitChange={(v) => setConfig({ ...config, link: v })}
          label="Link Limit:"
          defaultValue={defaultConfig.link.amt}
        />
        <LimitOption
          limit={config.cast}
          onLimitChange={(v) => setConfig({ ...config, cast: v })}
          label="Cast Limit:"
          defaultValue={defaultConfig.cast.amt}
        />
        <LimitOption
          limit={config.time}
          onLimitChange={(v) => setConfig({ ...config, time: v })}
          label="Time Limit:"
          defaultValue={defaultConfig.time.amt}
        />
        <LimitOption
          limit={config.extend}
          onLimitChange={(v) => setConfig({ ...config, extend: v })}
          label="Extensions:"
          defaultValue={defaultConfig.extend.amt}
        />
      </div>
    </div>
  );
};

export default Lobby;
