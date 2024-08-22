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

  const setVideoNode = useCallback(
    (videoNode) => {
      if (videoNode && remoteStream) {
        videoNode.srcObject = remoteStream;
      }
    },
    [remoteStream]
  );

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket) => {
      const peer = new Peer({
        initiator: true,
        stream: myStream,
        trickle: false,
      });

      peer.on("signal", (signal) => {
        console.log("Initiating call, sending offer signal:", signal);
        webrtcSocket.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream:", stream);
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

    webrtcSocket.on(
      "receiveClient2sAnswerSignalFromServer",
      ({ callFromUserSocketId, answerSignal }) => {
        console.log("Received answer signal from server:", answerSignal);
        if (callRejected) return;
        peerRef.current.signal(answerSignal);
      }
    );

    webrtcSocket.on("callDeclined", () => {
      setCallRejected(true);
      console.log("The call was declined");
    });

    return () => {
      webrtcSocket.off("receiveClient2sAnswerSignalFromServer");
      webrtcSocket.off("callDeclined");
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [mySocketId, myStream, othersSocketId, webrtcSocket, callRejected]);

  if (callRejected) {
    return <p>The call was rejected</p>;
  }

  return (
    <>
      {remoteStream && (
        <video width="200px" ref={setVideoNode} autoPlay={true} />
      )}
    </>
  );
}

export default InitiatedVideoCalls;
