import React, { useEffect, useState, useRef, useContext } from "react";
import { connect } from "react-redux";
import Grid from "./Grid";
import ImagesBuffer from "./ImagesBuffer";
import Map from "./Map";
import CanvasContext from "./CanvasContext";
import MyCharacter from "./MyCharacter";
import { MAP_DIMENSIONS, TILE_SIZE, MAP_TILE_IMAGES } from "./mapConstants";
import OtherCharacters from "./OtherCharacters";
import VideoCalls from "./VideoCalls";
import MyVideo from "./MyVideo";

const Office = ({ mapImagesLoaded, gameStatus, webrtcSocket }) => {
  const [myStream, setMyStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }, []);

  const width = MAP_DIMENSIONS.COLS * TILE_SIZE;
  const height = MAP_DIMENSIONS.ROWS * TILE_SIZE;
  const context = useContext(CanvasContext);

  useEffect(() => {
    return () => {
      context &&
        context.canvas.clearRect(
          0,
          0,
          context.canvas.width,
          context.canvas.height
        );
    };
  }, [context]);

  return (
    <>
      <ImagesBuffer />
      {Object.keys(mapImagesLoaded).length ===
        Object.keys(MAP_TILE_IMAGES).length && (
        <>
          <Grid width={width} height={height}>
            <Map />
          </Grid>
        </>
      )}
      {gameStatus.mapLoaded && (
        <>
          <MyCharacter webrtcSocket={webrtcSocket} />
          <OtherCharacters />
          <VideoCalls webrtcSocket={webrtcSocket} />
        </>
      )}
      {myStream && <MyVideo myStream={myStream} />}
    </>
  );
};

const mapStateToProps = (state) => ({
  mapImagesLoaded: state.mapImagesLoaded,
  gameStatus: state.gameStatus,
});

export default connect(mapStateToProps)(Office);
