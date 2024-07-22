// GameLoop.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import CanvasContext from "./CanvasContext";
import { MOVE_DIRECTIONS, MAP_DIMENSIONS, TILE_SIZE } from "./mapConstants";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { checkMapCollision } from "./utils";
import { update } from "./slices/allCharactersSlice"; // Correctly import the update action
import { ref, set, onValue } from "firebase/database";
import { firebaseDatabase } from "../firebase/firebase";

const GameLoop = ({ children, allCharactersData, updateAllCharactersData }) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    // frameCount used for re-rendering child components
    console.log("initial setContext");
    setContext({ canvas: canvasRef.current.getContext("2d"), frameCount: 0 });
  }, [setContext]);

  const loopRef = useRef();
  const mycharacterData = allCharactersData[MY_CHARACTER_INIT_CONFIG.id];

  const moveMyCharacter = useCallback(
    (e) => {
      const key = e.key.toLowerCase(); // Normalize key to lowercase
      if (MOVE_DIRECTIONS[key]) {
        const [dx, dy] = MOVE_DIRECTIONS[key];
        const newPosition = {
          x: mycharacterData.position.x + dx,
          y: mycharacterData.position.y + dy,
        };

        if (!checkMapCollision(newPosition.x, newPosition.y)) {
          const updatedCharacterData = {
            ...allCharactersData,
            [MY_CHARACTER_INIT_CONFIG.id]: {
              ...mycharacterData,
              position: newPosition,
            },
          };

          // Update the new position in Firebase
          const myId = MY_CHARACTER_INIT_CONFIG.id;
          set(ref(firebaseDatabase, `users/${myId}/position`), newPosition);

          updateAllCharactersData(updatedCharacterData);
        }
      }
    },
    [mycharacterData, allCharactersData, updateAllCharactersData]
  );

  const tick = useCallback(() => {
    if (context != null) {
      setContext({
        canvas: context.canvas,
        frameCount: (context.frameCount + 1) % 60,
      });
    }
    loopRef.current = requestAnimationFrame(tick);
  }, [context]);

  useEffect(() => {
    loopRef.current = requestAnimationFrame(tick);
    return () => {
      loopRef.current && cancelAnimationFrame(loopRef.current);
    };
  }, [loopRef, tick]);

  useEffect(() => {
    document.addEventListener("keydown", moveMyCharacter);
    return () => {
      document.removeEventListener("keydown", moveMyCharacter);
    };
  }, [moveMyCharacter]);

  useEffect(() => {
    const allCharactersRef = ref(firebaseDatabase, "users/");

    onValue(allCharactersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        updateAllCharactersData(data);
      }
    });

    return () => {
      // Unsubscribe when component unmounts
      allCharactersRef.off();
    };
  }, [updateAllCharactersData]);

  return (
    <CanvasContext.Provider value={context}>
      <canvas
        ref={canvasRef}
        width={TILE_SIZE * MAP_DIMENSIONS.COLS}
        height={TILE_SIZE * MAP_DIMENSIONS.ROWS}
        className="main-canvas"
      />
      {children}
    </CanvasContext.Provider>
  );
};

const mapStateToProps = (state) => {
  return { allCharactersData: state.allCharacters.users };
};

const mapDispatchToProps = { updateAllCharactersData: update };

export default connect(mapStateToProps, mapDispatchToProps)(GameLoop);
