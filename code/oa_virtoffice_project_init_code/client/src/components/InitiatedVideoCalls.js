import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef();
  const [remoteStream, setRemoteStream] = useState(null);
  const [callRejected, setCallRejected] = useState(false);

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket) => {
      const peer = new Peer({
        initiator: true,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        console.log("Initiating call, sending offer signal:", signal);
        webrtcSocket.current.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        setRemoteStream(stream);
      });

      return peer;
    },
    []
  );

  useEffect(() => {
    peerRef.current = createPeer(
      othersSocketId,
      mySocketId,
      myStream,
      webrtcSocket
    );

    const handleAnswerSignal = ({ callFromUserSocketId, answerSignal }) => {
      console.log("Received answer signal from server:", answerSignal);
      if (!callRejected && peerRef.current) {
        peerRef.current.signal(answerSignal);
      }
    };

    const handleCallDeclined = () => {
      setCallRejected(true);
      console.log("The call was declined");
    };

    webrtcSocket.on(
      "receiveClient2sAnswerSignalFromServer",
      handleAnswerSignal
    );
    webrtcSocket.on("callDeclined", handleCallDeclined);

    return () => {
      webrtcSocket.off(
        "receiveClient2sAnswerSignalFromServer",
        handleAnswerSignal
      );
      webrtcSocket.off("callDeclined", handleCallDeclined);
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [
    mySocketId,
    myStream,
    othersSocketId,
    webrtcSocket,
    callRejected,
    createPeer,
  ]);

  if (callRejected) {
    return <p>The call was rejected</p>;
  }

  return (
    <>
      {remoteStream && (
        <video
          width="200px"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = remoteStream;
          }}
        />
      )}
    </>
  );
}

export default InitiatedVideoCalls;
