import React, { useEffect, useRef, useCallback, useState } from "react";
import Peer from "simple-peer";
import { createPeer } from "../utils/createPeer"; //createPeer is a function that creates a peer connection, it takes the socket ids of the caller and the callee, and the socket object
import { peerRef } from "../utils/peerRef"; //peerRef is a reference to the peer connection

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketIds,
  webrtcSocket,
}) {
  const peer = new Peer({ initiator: true, stream: myStream, trickle: false });
  peer.on(
    "signal",
    (signal) => {
      webrtcSocket.emit("offer-signal", {
        callToUserSocketId: othersSocketIds,
        callFromUserSocketId: mySocketId,
        offerSignal: signal,
      });
      return peer;
    },
    []
  );
  useEffect(() => {
    peerRef.current = createPeer(othersSocketIds, mySocketId, webrtcSocket);
    //add logic for listening on the answer signal and make sure the signal is sent from callToUserId and print answer.
    webrtcSocket.on(
      "receiveAnswerSignal",
      ({ callFromUserSocketId, answerSignal }) => {
        console.log("Answer received from: ", callFromUserSocketId);
        console.log(" Answer signal: ", answerSignal);
        peer.signal(answerSignal); //peer.signal is a function that accepts an answer signal and sends it to the peer connection
        //it works like a callback function that is called when the answer signal is received
      }
    );
    return () => {
      webrtcSocket.off("receiveAnswerSignal"); // this is to make sure that the event listener is removed when the component is unmounted
    };
  }, [mySocketId, myStream, othersSocketIds, webrtcSocket]);
  return null;
}

export default InitiatedVideoCalls;
