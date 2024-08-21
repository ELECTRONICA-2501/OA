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
  const videoRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false); // State to handle call acceptance

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
        console.log("Received remote stream:", stream);
        setRemoteStream(stream); // Save the remote stream to state
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
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [
    isCallAccepted,
    mySocketId,
    myStream,
    othersSocketId,
    webrtcSocket,
    offerSignal,
  ]);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isCallAccepted) {
    return (
      <div>
        <p>Incoming Call</p>
        <button onClick={acceptCall}>Accept</button>
        <button onClick={declineCall}>Decline</button>
      </div>
    );
  }

  return <video ref={videoRef} autoPlay playsInline />;
}

export default ReceivedVideoCalls;
