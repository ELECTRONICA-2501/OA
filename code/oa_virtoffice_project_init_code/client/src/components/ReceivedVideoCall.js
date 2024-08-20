import React, { useEffect, useRef, useCallback, useState } from "react";
import Peer from "simple-peer";

function ReceivedVideoCall({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
  offerSignal,
}) {
  const peerRef = useRef(null);
  const [otherStream, setOtherStream] = useState(null);

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket, offerSignal) => {
      const peer = new Peer({
        initiator: false,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        webrtcSocket.emit("sendAnswer", {
          callFromUserSocketId: othersSocketId,
          callToUserSocketId: mySocketId,
          answerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        setOtherStream(stream);
      });

      peer.signal(offerSignal);
      return peer;
    },
    []
  );

  useEffect(() => {
    peerRef.current = createPeer(
      othersSocketId,
      mySocketId,
      myStream,
      webrtcSocket,
      offerSignal
    );

    // Clean up the peer connection when component unmounts or dependencies change
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [mySocketId, myStream, othersSocketId, webrtcSocket]);

  return null;
}

export default ReceivedVideoCall;
