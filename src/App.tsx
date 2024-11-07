import logo from './logo.svg';
import './App.css';
import { io } from 'socket.io-client';
import { Link, Routes, Route } from 'react-router-dom';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
console.log(URL)
export const socket = io(URL);

function App() {
  const foo = () => {
	  console.log("sending to socket")
	socket.emit("message", "yo")
  }


    
  const home = <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
	<button onClick={foo}> Send </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
	<Link to="game"> Game </Link>
      </header>
    </div>


    const game = <div> game </div>


  return (
         <Routes>
            <Route path="/" element={home} />
            <Route path="/game" element={game} />
         </Routes>
  );
}

export default App;
