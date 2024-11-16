import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";

type LinkLimit = { type: "unlimited" } | { type: "limited"; amt: number };

const LinkLimitOption = ({
  limit,
  onLimitChange,
}: {
  limit: LinkLimit;
  onLimitChange: (_: LinkLimit) => void;
}) => (
  <label>
    Link Limit:
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
                : { type: "limited", amt: 3 },
            )
          }
        />
      </label>
      <input
        type="number"
        className="border border-gray-500 rounded"
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

const Lobby = () => {
  /* TODO: Add:
   * handicap
   * language selector
   * player indicators
   * */

  const [limit, setLimit] = useState<LinkLimit>({ type: "limited", amt: 3 });
  const navigate = useNavigate();

  return (
    <div className="relative h-screen">
      <div className="absolute top-3/4 left-1/2 flex flex-col gap-10 -translate-y-1/2 -translate-x-1/2">
        <button
          className="text-3xl bg-sky-300 rounded mx-3 p-3"
          onClick={() =>
            navigate({
              pathname: "/solo/game",
              search: createSearchParams({
                limit:
                  limit.type === "unlimited" ? "unlimited" : "" + limit.amt,
              }).toString(),
            })
          }
        >
          Start
        </button>
        <LinkLimitOption limit={limit} onLimitChange={setLimit} />
      </div>
    </div>
  );
};

export default Lobby;
