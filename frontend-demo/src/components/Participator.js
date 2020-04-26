import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import VideocamOffSharpIcon from '@material-ui/icons/VideocamOffSharp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
}));

const Participator = ({ id, fullName, status, mediaStream,kind, onClick,isVideoPause ,isAudioPause}) => {
  const videoRef = React.createRef();
  const audioRef = React.createRef();
  const [isLoading, setIsLoading] = useState(true);
  const classes = useStyles();

  useEffect(() => {
    try {

      console.log("Participator.............................")
      if(kind==='audio'){
        audioRef.current.srcObject = mediaStream;
        setIsLoading(false);
        return
      }

      setIsLoading(true);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.addEventListener("loadeddata", (event) => {
        setIsLoading(false);
      });


    } catch (ex) {
      console.error(ex);
    }
  }, [mediaStream]);
  
  return (
    <>
      <div
        className={classes.root}
        onClick={() => {
          onClick(id);
        }}
      >
        <div
          title={fullName}
          className={`Participation-image video ${status} active`}
        >
          {isLoading && <CircularProgress color="secondary" />}
          {kind!=='audio' && (<video width={265} ref={videoRef} autoPlay playsInline></video>)}
         {kind==='audio' && (<audio ref={audioRef} autoPlay playsInline></audio>)}
         {isVideoPause && <VideocamOffSharpIcon style={{ color: red[500] }} />}
         {isAudioPause && <VolumeOffIcon style={{ color: red[500] }} />}
         
          
        </div>
      </div>
    </>
  );
};

Participator.defaultProps = {};

export default Participator;
