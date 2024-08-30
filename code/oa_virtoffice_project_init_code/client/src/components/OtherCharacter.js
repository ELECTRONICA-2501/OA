import React, { useContext, useEffect } from "react";
import CanvasContext from "./CanvasContext";
import {
  CHARACTER_IMAGE_SIZE,
  CHARACTER_CLASSES_MAP,
} from "./characterConstants";
import { TILE_SIZE } from "./mapConstants";

function OtherCharacter({ name, x, y, characterClass }) {
  const context = useContext(CanvasContext);

  useEffect(() => {
    if (context == null) {
      return;
    } //check if the context is available

    const characterImg = document.querySelector(
      `#character-sprite-img-${characterClass}`
    );
    const { sx, sy } = CHARACTER_CLASSES_MAP[characterClass].icon;
    context.canvas.drawImage(
      characterImg,
      sx,
      sy,
      CHARACTER_IMAGE_SIZE - 5,
      CHARACTER_IMAGE_SIZE - 5,
      x * TILE_SIZE,
      y * TILE_SIZE,
      CHARACTER_IMAGE_SIZE,
      CHARACTER_IMAGE_SIZE
    );
  }, [context, x, y, characterClass]);
  return null;
}

export default OtherCharacter;
