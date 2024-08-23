import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { MY_CHARACTER_INIT_CONFIG } from "./characterConstants";
import { webrtcSocket } from "../App";

function VideoCalls({ myCharacterData, otherCharactersData, webrtcSocket }) {
  const [myStream, setMyStream] = useState(null);
  const [peers, setPeers] = useState({});
  const peerConnections = useRef({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }, []);

  useEffect(() => {
    webrtcSocket.on("user-joined", ({ userId }) => {
      const peerConnection = new RTCPeerConnection();
      peerConnections.current[userId] = peerConnection;

      peerConnection.ontrack = (event) => {
        const [stream] = event.streams;
        setPeers((prevPeers) => ({
          ...prevPeers,
          [userId]: { userId, stream },
        }));
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          webrtcSocket.emit("ice-candidate", {
            to: userId,
            candidate: event.candidate,
          });
        }
      };

      myStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, myStream);
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
        setPeers((prevPeers) => ({
          ...prevPeers,
          [from]: { userId: from, stream },
        }));
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          webrtcSocket.emit("ice-candidate", {
            to: from,
            candidate: event.candidate,
          });
        }
      };

      myStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, myStream);
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
      peerConnections.current[from].addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });

    return () => {
      webrtcSocket.off("user-joined");
      webrtcSocket.off("offer");
      webrtcSocket.off("answer");
      webrtcSocket.off("ice-candidate");
    };
  }, [webrtcSocket, myStream]);

  return (
    <div>
      {Object.values(peers).map((peer) => (
        <video
          key={peer.userId}
          width="200px"
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = peer.stream;
          }}
        />
      ))}
    </div>
  );
}

const mapStateToProps = (state) => {
  const myCharacterData =
    state.allCharacters.users[MY_CHARACTER_INIT_CONFIG.id];
  const otherCharactersData = Object.keys(state.allCharacters.users)
    .filter((id) => id !== MY_CHARACTER_INIT_CONFIG.id)
    .reduce((filteredObj, key) => {
      filteredObj[key] = state.allCharacters.users[key];
      return filteredObj;
    }, {});
  return { myCharacterData, otherCharactersData };
};

export default connect(mapStateToProps)(VideoCalls);
