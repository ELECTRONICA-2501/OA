import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function ReceivedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
  offerSignal,
}) {
  const peerRef = useRef(null);
  const [otherStream, setOtherStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket, offerSignal) => {
      const peer = new Peer({
        initiator: false,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        console.log("Sending answer signal:", signal);
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

  const acceptCall = () => {
    setIsCallAccepted(true);
  };

  const declineCall = () => {
    webrtcSocket.emit("declineCall", { callFromUserSocketId: mySocketId });
  };

  useEffect(() => {
    if (isCallAccepted) {
      peerRef.current = createPeer(
        othersSocketId,
        mySocketId,
        myStream,
        webrtcSocket,
        offerSignal
      );

      webrtcSocket.on("receiveAnswer", (payload) => {
        console.log("Received answer signal:", payload);
        if (payload.callFromUserSocketId === othersSocketId) {
          peerRef.current.signal(payload.answerSignal);
        }
      });
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      webrtcSocket.off("receiveAnswer");
    };
  }, [
    isCallAccepted,
    mySocketId,
    myStream,
    othersSocketId,
    webrtcSocket,
    offerSignal,
    createPeer,
  ]);

  if (!isCallAccepted) {
    return (
      <div>
        <p>Incoming Call</p>
        <button onClick={acceptCall}>Accept</button>
        <button onClick={declineCall}>Decline</button>
      </div>
    );
  }

  return (
    <>
      {otherStream && (
        <video
          id="videoNode"
          width="200px"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = otherStream;
          }}
        />
      )}
    </>
  );
}

export default ReceivedVideoCalls;
