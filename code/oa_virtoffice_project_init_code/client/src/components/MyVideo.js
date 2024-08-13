import React, { useCallback } from "react";

function MyVideo({ myStream }) {
  const setVideoNode = useCallback(
    (videoNode) => {
      videoNode && (videoNode.srcObject = myStream);
    },
    [myStream]
  );

  return (
    <>
      {myStream && <video width="200px" ref={setVideoNode} autoPlay={true} />}
    </>
  );
}

export default MyVideo;
