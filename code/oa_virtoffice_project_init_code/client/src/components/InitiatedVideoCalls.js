import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef();

  const [remoteStream, setRemoteStream] = useState();
  const setVideoNode = useCallback(
    (videoNode) => {
      videoNode && (videoNode.srcObject = remoteStream);
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
        webrtcSocket.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });
      //peer.addStream(myStream);
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
    webrtcSocket.on("receiveAnswer", (payload) => {
      if (payload.callToUserSocketId === othersSocketId) {
        //const peer = peerRef.current.find(p => p.socketId === othersSocketId);
        peerRef.current.signal(payload.answerSignal);
      }
    });
    peerRef.current.on("stream", (stream) => {
      setRemoteStream(stream);
    });
  }, [othersSocketId, mySocketId, myStream, webrtcSocket]);

  return (
    <>
      {remoteStream && (
        <video width="200px" ref={setVideoNode} autoPlay={true} />
      )}
    </>
  );
}

export default InitiatedVideoCalls;
