import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function IncomingCall({ from, webrtcSocket, myStream }) {
  const peerRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

  const createPeer = useCallback(
    (from, myStream, webrtcSocket, offerSignal) => {
      const peer = new Peer({
        initiator: false,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        webrtcSocket.emit("sendAnswer", {
          callFromUserSocketId: from,
          answerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        setRemoteStream(stream);
      });

      peer.signal(offerSignal);
      return peer;
    },
    []
  );

  const acceptCall = () => {
    setIsCallAccepted(true);
    webrtcSocket.emit("acceptCall", { from });
  };

  const declineCall = () => {
    webrtcSocket.emit("declineCall", { callFromUserSocketId: from });
  };

  useEffect(() => {
    webrtcSocket.on("offer", ({ from, offer }) => {
      peerRef.current = createPeer(from, myStream, webrtcSocket, offer);
    });

    return () => {
      webrtcSocket.off("offer");
    };
  }, [webrtcSocket, myStream, createPeer]);

  return (
    <div>
      {isCallAccepted ? (
        remoteStream && (
          <video
            width="200px"
            autoPlay
            playsInline
            ref={(video) => {
              if (video) video.srcObject = remoteStream;
            }}
          />
        )
      ) : (
        <div>
          <p>Incoming Call from {from}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={declineCall}>Decline</button>
        </div>
      )}
    </div>
  );
}

export default IncomingCall;
