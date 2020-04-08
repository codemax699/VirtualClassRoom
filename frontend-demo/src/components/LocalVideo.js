import React, { useEffect, useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const LocalVideo = ({ id, mediaStream, onClick }) => {
  const localVideoRef = React.createRef();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.addEventListener("loadeddata", (event) => {
        setIsLoading(false);
      });
    } catch (ex) {
      console.error(ex);
    }
  }, [mediaStream]);
  return (
    <>
      <div
        onClick={() => {
          onClick(id);
        }}
      >
        {isLoading && <CircularProgress color="secondary" />}
        <video width={265} ref={localVideoRef} autoPlay playsInline></video>
      </div>
    </>
  );
};

export default LocalVideo;
