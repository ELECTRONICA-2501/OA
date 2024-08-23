import React, { useEffect, useState } from "react";
import MyVideo from "./MyVideo";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import InitiatedVideoCalls from "./InitiatedVideoCalls";
import ReceivedVideoCalls from "./ReceivedVideoCalls";
import webrtcSocket from "../App";

function VideoCalls({ myCharacterData, otherCharactersData }) {
  const [myStream, setMyStream] = useState(); // This is the stream of my video
  const [offersReceived, setOffersReceived] = useState({}); // This is the list of offers received from other users

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Stream obtained:", stream);
        setMyStream(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices", error);
      });
  }, []);

  useEffect(() => {
    webrtcSocket.on("receiveOffer", (payload) => {
      console.log(
        "Received offer from ",
        payload.callFromUserSocketId,
        ", offerReceived: ",
        Object.keys(offersReceived)
      );
      if (!Object.keys(offersReceived).includes(payload.callFromUserSocketId)) {
        setOffersReceived({
          ...offersReceived,
          [payload.callFromUserSocketId]: payload.offerSignal,
        });
      }
    });
  }, [webrtcSocket, offersReceived]);

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
          {Object.keys(initiateCallToUsers).map((otherUserId) => (
            <InitiatedVideoCalls
              key={initiateCallToUsers[otherUserId].socketId}
              mySocketId={myCharacterData.socketId}
              myStream={myStream}
              othersSocketId={initiateCallToUsers[otherUserId].socketId}
              webrtcSocket={webrtcSocket}
            />
          ))}
          {Object.keys(offersReceived).map((othersSocketId) => {
            const matchingUserIds = Object.keys(otherCharactersData).filter(
              (otherUserId) =>
                otherCharactersData[otherUserId].socketId === othersSocketId
            );
            console.assert(
              matchingUserIds.length === 1,
              "Unexpected list of matching user ids",
              matchingUserIds
            );
            return (
              <ReceivedVideoCalls
                key={othersSocketId}
                mySocketId={myCharacterData.socketId}
                myStream={myStream}
                othersSocketId={othersSocketId}
                webrtcSocket={webrtcSocket}
                offerSignal={offersReceived[othersSocketId]}
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
