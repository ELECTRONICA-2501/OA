import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import CanvasContext from "./CanvasContext";
import { MOVE_DIRECTIONS, MAP_DIMENSIONS, TILE_SIZE } from "./mapConstants";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { checkMapCollision } from "./utils";
import { update } from "./slices/allCharactersSlice"; // Correctly import the update action
//import FirebaseListener from "../FirebaseListener";
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
        //if any of the keys are pressed
        const [dx, dy] = MOVE_DIRECTIONS[key]; //get the direction ex. [0, -1] for up
        const newPosition = {
          //this is a new position object
          x: mycharacterData.position.x + dx, //add the direction to the current position
          y: mycharacterData.position.y + dy, //add the direction to the current position
        };

        if (!checkMapCollision(newPosition.x, newPosition.y)) {
          //uses the check map collision to make sure ur not colliding with obstacles or maps edge
          const updatedCharacterData = {
            //creates a new object that updates teh position of the character while keeping the other data the same
            ...allCharactersData, //copy the current character data
            [MY_CHARACTER_INIT_CONFIG.id]: {
              //update the character data for the current character
              ...mycharacterData, //copy the current character data
              position: newPosition, //update the position
            },
          };
          //firebase ref to update the character data
          const myId = MY_CHARACTER_INIT_CONFIG.id;
          firebaseDatabase.ref("allCharacters").set(newPosition);
          updateAllCharactersData(updatedCharacterData); //update the character data
        }
      }
    },
    [mycharacterData, allCharactersData, updateAllCharactersData] //dependencies
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
