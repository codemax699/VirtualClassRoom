import React, { useEffect, useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const LocalVideo = ({ id, videoStream,audioStream,kind, onClick }) => {
  const localVideoRef = React.createRef();
  const localAudioRef = React.createRef();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    try {
      if(kind==='audio'){
        localAudioRef.current.srcObject = audioStream;
        return
      }
      
      if (localVideoRef.current && videoStream) {
        setIsLoading(true);
        localVideoRef.current.srcObject = videoStream;
        localVideoRef.current.addEventListener("loadeddata", (event) => {
          setIsLoading(false);
        });
        
      } else {
        console.log("LocalVideo", "useEffect", "Video Element Not Binding");
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [videoStream,audioStream]);
  return (
    <>
      <div
        onClick={() => {
          onClick(id);
        }}
      >
        {isLoading && <CircularProgress color="secondary" />}
        <video width={265} ref={localVideoRef} autoPlay playsInline></video>
        <audio width={265} ref={localAudioRef} autoPlay playsInline></audio>
      </div>
    </>
  );
};

export default LocalVideo;
