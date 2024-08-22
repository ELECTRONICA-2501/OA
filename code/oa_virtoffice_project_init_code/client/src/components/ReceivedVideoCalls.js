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
  //const videoRef = useRef(null);
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

      /*
      peer.on("stream", (stream) => {
        setRemoteStream(stream); // Save the remote stream to state
      });
      */

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
  return <> </>;

  /* Old Code:

  // const peerRef = useRef(null);
  // const [otherStream, setOtherStream] = useState(null);

  // const createPeer = useCallback(
  //   (othersSocketId, mySocketId, myStream, webrtcSocket, offerSignal) => {
  //     const peer = new Peer({
  //       initiator: false,
  //       stream: myStream,
  //       trickle: false,
  //     });

  //     peer.on("signal", (signal) => {
  //       webrtcSocket.emit("sendAnswer", {callFromUserSocketId: othersSocketId,callToUserSocketId: mySocketId,answerSignal: signal,}); //webscoket sends answer to server
  //     });

  //     peer.on("stream", (stream) => {
  //       navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
  //         setOtherStream(stream);
  //     });

  //     peer.signal(offerSignal); //this tell the peer we received the offer signal, fired right after the peer.on("signal", (signal) => {}) is created. only in received video calls.
  //       return peer;
  //     }, []);

  */
}

export default ReceivedVideoCalls;
