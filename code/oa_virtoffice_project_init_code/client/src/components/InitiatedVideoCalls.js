import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef();
  const videoRef = useRef(null);
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
        webrtcSocket.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream:", stream);
        setRemoteStream(stream); // Save the remote stream to state
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

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callRejected) {
    return <p>The call was rejected</p>;
  }

  return <video ref={videoRef} autoPlay playsInline />;

  /* Old Code:
  
  // const peerRef = useRef();
  // const [stream, setRemoteStream] = useState(null);
  // const createPeer = useCallback((othersSocketId, mySocketId, myStream, webrtcSocket, isCaller) => {
  //   const peer = new Peer({
  //     initiator: true,
  //     stream: myStream,
  //     trickle: false,
  //   });
  //   peer.on("signal", (signal) => { //the initiator is true in this case, so it fires the signal event.
  //     webrtcSocket.emit("sendOffer", {callToUserSocketId: othersSocketId, callFromUserSocketId: mySocketId, offerSignal: signal});
  //   });
  //   //week 6 task display and render video on both Initiator and Receiver.
  //   peer.on("stream", (stream => {
  //     navigator.mediaDevices.getUserMedia({ video: true, audio: true}, (stream) => {
  //       const call = peer.call(othersSocketId, stream);
  //       call.on("stream", (remoteStream) => {
  //          <video ref = { peerRef } autoPlay playsInline />
  //          setRemoteStream(remoteStream);
  //     });
  //   },
  //   (error) => {
  //         console.error("error getting user media: ", error);
  //         },
  //       );
  //   }))
  //   
  //   return peer;
  // }, []);

  */
}

export default InitiatedVideoCalls;
