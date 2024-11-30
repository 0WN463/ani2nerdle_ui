import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="flex justify-end px-5 mt-5">
    <Link
      className="text-blue-500 hover:underline"
      to="https://ko-fi.com/0wn3d"
    >
      {" "}
      Support me{" "}
    </Link>
  </footer>
);

export default Footer;
