import { Link } from "react-router-dom";
import Support from "../support/Support";

const Main = () => {
  return (
    <>
      <div className="flex flex-col gap-4 mx-10">
        <header style={{ fontFamily: "Font Awesome 6 Sharp Duotone" }}>
          <div className="text-3xl sm:text-6xl font-bold text-center mt-48">
            ANI2<span className="text-teal-400">NERDLE</span>
          </div>
        </header>
        <Link
          className="text-center rounded-full bg-blue-300 w-32 mx-auto"
          to="/solo"
        >
          Solo
        </Link>
        <Link
          className="text-center rounded-full bg-red-300 w-32 mx-auto"
          to="/multi"
        >
          Multiplayer
        </Link>
      </div>
      <Support />
    </>
  );
};

export default Main;
