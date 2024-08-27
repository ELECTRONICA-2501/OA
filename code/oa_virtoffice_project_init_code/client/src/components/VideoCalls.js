import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { webrtcSocket } from "../App";

const VideoCalls = ({ webrtcSocket, setRemoteStream }) => {
  const peerConnections = useRef({});
  const myStream = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        webrtcSocket.on("user-joined", ({ userId }) => {
          const peerConnection = new RTCPeerConnection();
          peerConnections.current[userId] = peerConnection;

          peerConnection.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              webrtcSocket.emit("ice-candidate", {
                to: userId,
                candidate: event.candidate,
              });
            }
          };

          myStream.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, myStream.current);
          });

          peerConnection
            .createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
              webrtcSocket.emit("offer", {
                to: userId,
                offer: peerConnection.localDescription,
              });
            });
        });

        webrtcSocket.on("offer", ({ from, offer }) => {
          const peerConnection = new RTCPeerConnection();
          peerConnections.current[from] = peerConnection;

          peerConnection.ontrack = (event) => {
            const [stream] = event.streams;
            setRemoteStream(stream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              webrtcSocket.emit("ice-candidate", {
                to: from,
                candidate: event.candidate,
              });
            }
          };

          myStream.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, myStream.current);
          });

          peerConnection
            .setRemoteDescription(new RTCSessionDescription(offer))
            .then(() => peerConnection.createAnswer())
            .then((answer) => peerConnection.setLocalDescription(answer))
            .then(() => {
              webrtcSocket.emit("answer", {
                to: from,
                answer: peerConnection.localDescription,
              });
            });
        });

        webrtcSocket.on("answer", ({ from, answer }) => {
          peerConnections.current[from].setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        webrtcSocket.on("ice-candidate", ({ from, candidate }) => {
          const peerConnection = peerConnections.current[from];
          if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });
      });

    return () => {
      Object.values(peerConnections.current).forEach((peerConnection) => {
        peerConnection.close();
      });
      peerConnections.current = {};
    };
  }, [webrtcSocket, setRemoteStream]);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted style={{ width: "45%" }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: "45%" }} />
    </div>
  );
};

export default VideoCalls;
