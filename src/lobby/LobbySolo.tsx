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
  <label>
    {label}
    <div className="flex gap-2">
      <label>
        Unlimited
        <input
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
    </div>
  </label>
);

type Config = {
  link: Limit;
  cast: Limit;
  time: Limit;
};

const defaultConfig = {
  link: { type: "limited", amt: 3 },
  cast: { type: "limited", amt: 1 },
  time: { type: "limited", amt: 30 },
} as const;

const Lobby = () => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  const [config, setConfig] = useState<Config>(defaultConfig);
  const navigate = useNavigate();

  return (
    <div className="relative h-screen">
      <div className="absolute top-3/4 left-1/2 flex flex-col gap-4 -translate-y-1/2 -translate-x-1/2">
        <button
          className="text-3xl bg-sky-300 rounded mx-3 p-3"
          onClick={() =>
            navigate({
              pathname: "/solo/game",
              search: createSearchParams({
                link:
                  config.link.type === "unlimited"
                    ? "unlimited"
                    : "" + config.link.amt,
                cast:
                  config.cast.type === "unlimited"
                    ? "unlimited"
                    : "" + config.cast.amt,
                time:
                  config.time.type === "unlimited"
                    ? "unlimited"
                    : "" + config.time.amt,
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
      </div>
    </div>
  );
};

export default Lobby;
