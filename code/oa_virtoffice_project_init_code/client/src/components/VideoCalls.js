import React, { useEffect, useRef, useState } from "react";
import MyVideo from "./MyVideo";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import InitiatedVideoCall from "./InitiatedVideoCall";
import { webrtcSocket } from "../App";

function VideoCalls({ myCharacterData, otherCharactersData }) {
  const [myStream, setMyStream] = useState(); // this is the stream of my video
  const [offersRecieved, setOffersRecieved] = useState({}); // this is the list of offers recieved from other users

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
      });
  }, []);

  useEffect(() => {
    webrtcSocket.on("receiveOffer", (payload) => {
      console.log(
        "received offer from ",
        payload.callFromUserSocketId,
        ", offerReceived: ",
        Object.keys(offersRecieved)
      );
      if (!Object.keys(offersRecieved).includes(payload.callFromUserSocketId)) {
        setOffersRecieved({
          ...offersRecieved,
          [payload.callFromUserSocketId]: payload.offerSignal,
        });
      }
    });
  }, [webrtcSocket, offersRecieved]); // this is the event listener for the offer signal

  const myUserId = myCharacterData?.id;

  const initiateCallToUsers = Object.keys(otherCharactersData)
    .filter((othersUserId) => othersUserId >= myUserId)
    .reduce((filteredObj, key) => {
      filteredObj[key] = otherCharactersData[key];
      return filteredObj;
    }, {});

  return (
    <>
      {myCharacterData && myStream && (
        <div className="videos">
          <MyVideo myStream={myStream} />
          {Object.keys(initiateCallToUsers).map((otherUserId) => {
            return (
              <InitiatedVideoCall
                key={initiateCallToUsers[otherUserId].socketId}
                mySocketId={myCharacterData.socketId}
                myStream={myStream}
                othersSocketId={initiateCallToUsers[otherUserId].socketId}
                webrtcSocket={webrtcSocket}
              />
            );
          })}
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
