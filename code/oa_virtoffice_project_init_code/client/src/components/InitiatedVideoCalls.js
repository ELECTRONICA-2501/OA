import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef(); // Reference to the peer connection
  const videoRef = useRef(null); // Reference to the video element
  const [remoteStream, setRemoteStream] = useState(null); // State to hold the remote stream

  const createPeer = useCallback(
    (othersSocketId, mySocketId, myStream, webrtcSocket) => {
      const peer = new Peer({
        initiator: true, // This peer initiates the connection
        stream: myStream, // Send our stream to the remote peer
        trickle: false, // Disable trickling ICE candidates
      });

      peer.on("signal", (signal) => {
        // When this peer creates an offer signal, send it to the other user via the server
        webrtcSocket.emit("sendOffer", {
          callToUserSocketId: othersSocketId,
          callFromUserSocketId: mySocketId,
          offerSignal: signal,
        });
      });

      peer.on("stream", (stream) => {
        // When we receive the remote stream, save it in state
        setRemoteStream(stream);
      });

      return peer;
    },
    [] // Dependencies array is empty so this function is stable and won't be redefined
  );

  useEffect(() => {
    // Create the peer when this component mounts
    peerRef.current = createPeer(
      othersSocketId,
      mySocketId,
      myStream,
      webrtcSocket
    );

    // Listen for the answer signal from the remote peer via the server
    webrtcSocket.on(
      "receiveClient2sAnswerSignalFromServer",
      ({ callFromUserSocketId, answerSignal }) => {
        console.log(
          "Received client2s answer signal from server",
          callFromUserSocketId
        );
        // Pass the answer signal to the peer to complete the connection
        peerRef.current.signal(answerSignal);
      }
    );

    // Clean up when the component unmounts
    return () => {
      webrtcSocket.off("receiveClient2sAnswerSignalFromServer"); // Stop listening for answer signals
      if (peerRef.current) {
        peerRef.current.destroy(); // Clean up the peer connection
      }
    };
  }, [mySocketId, myStream, othersSocketId, webrtcSocket]); // Effect dependencies

  useEffect(() => {
    // When we have the remote stream, set it as the source for the video element
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]); // Run this effect whenever the remote stream changes

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
