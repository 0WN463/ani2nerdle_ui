import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";
import { Modal } from "../game/PanelBar";
import Support from "../support/Support";

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
  language: string;
};

const defaultConfig = {
  link: { type: "limited", amt: 3 },
  cast: { type: "limited", amt: 1 },
  time: { type: "limited", amt: 30 },
  extend: { type: "limited", amt: 1 },
  language: "Japanese",
} as const;

const Lobby = () => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  const [config, setConfig] = useState<Config>(defaultConfig);
  const [rulesOpen, setRulesOpen] = useState(false);
  const navigate = useNavigate();

  const toParam = (l: Limit) =>
    l.type === "unlimited" ? "unlimited" : "" + l.amt;

  return (
    <>
      <div>
        <div className="flex flex-col gap-4 mx-10">
          <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
            <div className="text-3xl sm:text-6xl font-bold text-center mt-48">
              ANI2<span className="text-teal-400">NERDLE</span>
            </div>
          </header>
          <button
            className="text-3xl bg-sky-300 rounded mx-auto px-12 py-3"
            onClick={() =>
              navigate({
                pathname: "/solo/game",
                search: createSearchParams({
                  link: toParam(config.link),
                  cast: toParam(config.cast),
                  time: toParam(config.time),
                  extend: toParam(config.extend),
                  language: config.language,
                }).toString(),
              })
            }
          >
            Start
          </button>

          <button
            className="text-xl underline decoration-dotted px-12 py-3"
            onClick={() => setRulesOpen(true)}
          >
            Rules
          </button>
          <Modal
            openModal={rulesOpen}
            closeModal={() => setRulesOpen(false)}
            className="w-4/5 lg:w-1/2"
            children={
              <ol>
                <li>
                  Goal: Connect as many animes as possible that share a voice
                  actor, before the time runs out.
                </li>
                <li>
                  Each voice actor can only be used a maximum of 3 (default
                  setting) times.
                </li>
                <li>
                  There are limited-use hints available, such as showing the
                  main cast of the current anime and extending the time.
                </li>
              </ol>
            }
          />

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
          <label className="flex gap-2 justify-around">
            Voice Actor Language:
            <select
              onChange={(e) =>
                setConfig({ ...config, language: e.target.value })
              }
            >
              <option value="Japanese">Japanese</option>
              <option value="English">English</option>
            </select>
          </label>
        </div>
      </div>
      <Support />
    </>
  );
};

export default Lobby;
