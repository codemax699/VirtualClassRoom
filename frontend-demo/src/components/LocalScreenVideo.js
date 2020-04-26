import React, { useEffect, useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

const LocalScreenVideo = ({ id, videoStream, onClick }) => {
  const LocalScreenVideoRef = React.createRef();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    try {
      console.log("LocalScreenVideo.............................")
      
      if (LocalScreenVideoRef.current && videoStream) {
        setIsLoading(true);
        LocalScreenVideoRef.current.srcObject = videoStream;
        LocalScreenVideoRef.current.addEventListener("loadeddata", (event) => {
          setIsLoading(false);
        });
        
      } else {
        console.log("LocalScreenVideo", "useEffect", "Video Element Not Binding");
      }
    } catch (ex) {
      console.error(ex);
    }
  }, [videoStream]);
  return (
    <>
      <div
        onClick={() => {
          onClick(id);
        }}
      >
        {isLoading && <CircularProgress color="secondary" />}
        <video width={265} ref={LocalScreenVideoRef} autoPlay playsInline></video>
        
      </div>
    </>
  );
};

export default LocalScreenVideo;
