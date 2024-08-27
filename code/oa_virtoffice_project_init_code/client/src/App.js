import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import GameLoop from "./components/GameLoop";
import Office from "./components/Office";
import { ref, remove } from "firebase/database";
import { firebaseDatabase } from "./firebase/firebase";
import { MY_CHARACTER_INIT_CONFIG } from "./components/characterConstants";
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

  useEffect(() => {
    const myCharacterRef = ref(
      firebaseDatabase,
      "users/" + MY_CHARACTER_INIT_CONFIG.id
    );

    return () => {
      // Cleanup function to remove character data from Firebase
      remove(myCharacterRef)
        .then(() => {
          console.log("Character data removed successfully.");
        })
        .catch((error) => {
          console.error("Error removing character data: ", error);
        });
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
