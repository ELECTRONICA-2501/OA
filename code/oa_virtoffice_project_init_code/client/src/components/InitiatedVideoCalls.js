import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState("initiating");

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket) => {
      console.log("Creating peer for initiated call");
      const peer = new Peer({
        initiator: true,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        console.log("Sending offer signal");
        webrtcSocket.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream");
        setRemoteStream(stream);
        setCallStatus("connected");
      });

      return peer;
    },
    []
  );

  useEffect(() => {
    console.log("Initiating call to", othersSocketId);
    peerRef.current = createPeer(
      othersSocketId,
      mySocketId,
      myStream,
      webrtcSocket
    );

    webrtcSocket.emit("initiateCall", { to: othersSocketId });
    setCallStatus("ringing");

    webrtcSocket.on("receiveAnswer", (payload) => {
      console.log("Received answer signal", payload);
      if (payload.from === othersSocketId) {
        peerRef.current.signal(payload.answerSignal);
        setCallStatus("connected");
      }
    });

    webrtcSocket.on("callDeclined", () => {
      console.log("Call was declined");
      setCallStatus("ended");
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      webrtcSocket.off("receiveAnswer");
      webrtcSocket.off("callDeclined");
    };
  }, [othersSocketId, mySocketId, myStream, webrtcSocket, createPeer]);

  const endCall = () => {
    console.log("Ending call");
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setCallStatus("ended");
    webrtcSocket.emit("endCall", { to: othersSocketId });
  };

  return (
    <div>
      {callStatus === "ringing" && <p>Calling...</p>}
      {callStatus === "connected" && remoteStream && (
        <video
          width="200px"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = remoteStream;
          }}
        />
      )}
      {callStatus === "ended" && <p>Call ended</p>}
      {callStatus !== "ended" && <button onClick={endCall}>End Call</button>}
    </div>
  );
}

export default InitiatedVideoCalls;
