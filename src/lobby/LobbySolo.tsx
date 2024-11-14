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
    Link Limit
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
      value={limit.type === "limited" ? limit.amt : ""}
      disabled={limit.type !== "limited"}
      min={1}
      onChange={(v) =>
        onLimitChange({ type: "limited", amt: parseInt(v.target.value) })
      }
    />
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
    <div className="App" style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          top: "80%",
          position: "absolute",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <button
          style={{ fontSize: "xx-large" }}
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
