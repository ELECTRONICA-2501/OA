import React, { useEffect, useState } from "react";
import MyVideo from "./MyVideo";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import InitiatedVideoCalls from "./InitiatedVideoCalls";
import ReceivedVideoCalls from "./ReceivedVideoCalls";
import { webrtcSocket } from "../App";

function VideoCalls({ myCharacterData, otherCharactersData }) {
  const [myStream, setMyStream] = useState();
  const [offersRecieved, setOffersRecieved] = useState({});
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [nearbyCharacter, setNearbyCharacter] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
      });
  }, []);

  useEffect(() => {
    webrtcSocket.on("receiveOffer", (payload) => {
      if (!Object.keys(offersRecieved).includes(payload.callFromUserSocketId)) {
        setOffersRecieved({
          ...offersRecieved,
          [payload.callFromUserSocketId]: payload.offerSignal,
        });
      }
    });
  }, [webrtcSocket, offersRecieved]);

  return (
    <>
      {myCharacterData && myStream && (
        <div className="videos">
          <MyVideo myStream={myStream} />
          {isInitiatingCall && (
            <InitiatedVideoCalls
              mySocketId={myCharacterData.socketId}
              myStream={myStream}
              othersSocketId={otherCharactersData[nearbyCharacter].socketId}
              webrtcSocket={webrtcSocket}
            />
          )}
          {Object.keys(offersRecieved).map((othersSocketId) => (
            <ReceivedVideoCalls
              key={othersSocketId}
              mySocketId={myCharacterData.socketId}
              myStream={myStream}
              othersSocketId={othersSocketId}
              webrtcSocket={webrtcSocket}
              offerSignal={offersRecieved[othersSocketId]}
            />
          ))}
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  const myCharacterData =
    state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id];
  const otherCharactersData = Object.keys(state.allCharacters.users)
    .filter((id) => id !== MY_CHARACTER_INIT_CONFIG.id)
    .reduce((filteredObj, key) => {
      filteredObj[key] = state.allCharacters.users[key];
      return filteredObj;
    }, {});
  return { myCharacterData, otherCharactersData };
};

export default connect(mapStateToProps)(VideoCalls);
