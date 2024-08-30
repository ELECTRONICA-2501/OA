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
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket, offerSignal) => {
      console.log("Creating peer for received call");
      const peer = new Peer({
        initiator: false,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        console.log("Sending answer signal");
        webrtcSocket.emit("sendAnswer", {
          callFromUserSocketId: othersSocketId,
          callToUserSocketId: mySocketId,
          answerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream");
        setRemoteStream(stream);
      });

      peer.signal(offerSignal);
      return peer;
    },
    []
  );

  const acceptCall = () => {
    console.log("Accepting call");
    setIsCallAccepted(true);
  };

  const declineCall = () => {
    console.log("Declining call");
    webrtcSocket.emit("declineCall", { callFromUserSocketId: othersSocketId });
  };

  useEffect(() => {
    console.log("Received call from", othersSocketId);
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
    createPeer,
  ]);

  useEffect(() => {
    webrtcSocket.on("endCall", () => {
      console.log("Call ended by the other user");
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      setIsCallAccepted(false);
      setRemoteStream(null);
    });

    return () => {
      webrtcSocket.off("endCall");
    };
  }, [webrtcSocket]);

  if (!isCallAccepted) {
    return (
      <div>
        <p>Incoming Call from {othersSocketId}</p>
        <button onClick={acceptCall}>Accept</button>
        <button onClick={declineCall}>Decline</button>
      </div>
    );
  }

  return (
    <div>
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
      <button
        onClick={() => webrtcSocket.emit("endCall", { to: othersSocketId })}
      >
        End Call
      </button>
    </div>
  );
}

export default ReceivedVideoCalls;
