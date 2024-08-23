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
  const setVideoNode = useCallback(
    (videoNode) => {
      videoNode && (videoNode.srcObject = remoteStream);
    },
    [remoteStream]
  );

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
    webrtcSocket.on("receiveAnser", (payload) => {
      if (payload.callFromUserSocketId === othersSocketId) {
        peerRef.current.signal(payload.answerSignal);
      }
    });
    peerRef.current.on("stream", (stream) => {
      setRemoteStream(stream);
    });
  }, [mySocketId, myStream, othersSocketId, webrtcSocket]);
  return (
    <>
      {remoteStream && (
        <video width="200px" ref={setVideoNode} autoPlay={true} />
      )}
    </>
  );
}

export default ReceivedVideoCalls;
