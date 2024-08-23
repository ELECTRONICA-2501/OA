import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import GameLoop from "./components/GameLoop";
import Office from "./components/Office";
import "./App.css";

export const WEBRTC_SOCKET = io("http://localhost:8080");

function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [mySocketId, setMySocketId] = useState(null);

  useEffect(() => {
    WEBRTC_SOCKET.on("connect", () => {
      setSocketConnected(true);
      setMySocketId(WEBRTC_SOCKET.id);
    });

    return () => {
      WEBRTC_SOCKET.off("connect");
    };
  }, []);

  return (
    <>
      <header></header>
      {socketConnected && (
        <main className="content">
          <GameLoop>
            <Office webrtcSocket={WEBRTC_SOCKET} />
          </GameLoop>
        </main>
      )}
      <footer></footer>
    </>
  );
}

export default App;
