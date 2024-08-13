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
  const peer = new Peer({
    initiator: true,
    stream: myStream,
    trickle: false,
  });
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
  }, [mySocketId, myStream, othersSocketIds, webrtcSocket]);
  return null;
}

export default InitiatedVideoCalls;
