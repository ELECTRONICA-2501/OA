import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
//import {MyVideo} from "../MyVideo.js"

function InitiatedVideoCalls({
  mySocketId,
  myStream,
  othersSocketId,
  webrtcSocket,
}) {
  const peerRef = useRef();
  //const videoRef = useRef(null);
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

      //This may actually go in ReceiverVideoCalls.js -----------------------------------

      /*peer.on("stream", (stream) => {
        var video = document.querySelector("video");
        if('srcObject' in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream);
        }
        video.onload = () => {
          video.play();
        };
      });
      */

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
