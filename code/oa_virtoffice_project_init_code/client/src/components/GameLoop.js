import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import CanvasContext from "./CanvasContext";
import { MOVE_DIRECTIONS, MAP_DIMENSIONS, TILE_SIZE } from "./mapConstants";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { checkMapCollision } from "./utils";
import { update } from "./slices/allCharactersSlice"; // Correctly import the update action
import { ref, set } from "firebase/database";
import { firebaseDatabase } from "../firebase/firebase";
import FirebaseListener from "./FirebaseListener";

const GameLoop = ({ children, allCharactersData, updateAllCharactersData }) => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [nearbyCharacter, setNearbyCharacter] = useState(null);
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);

  useEffect(() => {
    // frameCount used for re-rendering child components
    setContext({ canvas: canvasRef.current.getContext("2d"), frameCount: 0 });
  }, [setContext]);

  const loopRef = useRef();
  const mycharacterData = allCharactersData[MY_CHARACTER_INIT_CONFIG.id];

  const checkProximity = useCallback(() => {
    const nearby = Object.keys(allCharactersData).find((otherUserId) => {
      if (otherUserId === MY_CHARACTER_INIT_CONFIG.id) return false;

      const otherCharacter = allCharactersData[otherUserId];
      const distanceX = Math.abs(
        otherCharacter.position.x - mycharacterData.position.x
      );
      const distanceY = Math.abs(
        otherCharacter.position.y - mycharacterData.position.y
      );

      return distanceX <= 1 && distanceY <= 1; // Detect proximity
    });

    setNearbyCharacter(nearby);
  }, [mycharacterData, allCharactersData]);

  useEffect(() => {
    document.addEventListener("keydown", moveMyCharacter);
    checkProximity();

    return () => {
      document.removeEventListener("keydown", moveMyCharacter);
    };
  }, [moveMyCharacter, checkProximity]);

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

          updateAllCharactersData(updatedCharacterData);
          const userRef = ref(
            firebaseDatabase,
            `users/${MY_CHARACTER_INIT_CONFIG.id}`
          );
          set(userRef, updatedCharacterData[MY_CHARACTER_INIT_CONFIG.id]);

          checkProximity(); // Check for proximity after moving
        }
      }
    },
    [
      mycharacterData,
      allCharactersData,
      updateAllCharactersData,
      checkProximity,
    ]
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

  const handleInitiateCall = (otherUserId) => {
    console.log("Initiating call with: ", otherUserId);
    setIsInitiatingCall(true);
  };

  return (
    <CanvasContext.Provider value={context}>
      <canvas
        ref={canvasRef}
        width={TILE_SIZE * MAP_DIMENSIONS.COLS}
        height={TILE_SIZE * MAP_DIMENSIONS.ROWS}
        className="main-canvas"
      />
      <FirebaseListener />
      {children}
      {nearbyCharacter && !isInitiatingCall && (
        <button onClick={() => handleInitiateCall(nearbyCharacter)}>
          Initiate Call with {allCharactersData[nearbyCharacter].name}
        </button>
      )}
    </CanvasContext.Provider>
  );
};

const mapStateToProps = (state) => {
  return { allCharactersData: state.allCharacters.users };
};

const mapDispatchToProps = { updateAllCharactersData: update };

export default connect(mapStateToProps, mapDispatchToProps)(GameLoop);
