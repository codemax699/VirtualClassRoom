import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import ToolBar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import LocalVideo from "./LocalVideo";
import Participator from "./Participator";
import mediasoupSdk from "./Mediasoup/lib/index";
import ButtonGroup from "@material-ui/core/ButtonGroup";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export default function CenteredGrid() {
  const classes = useStyles();

  const [conferenceId, setConferenceId] = useState("");
  const [routerId, setRouterId] = useState("");
  const [consumers, setConsumers] = useState({});
  const [isProducer, setIsProducer] = useState(false);
  const [isConsumer, setIsConsumer] = useState(false);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [eventMsg, setEventMsg] = useState([
    "--------------------------------",
  ]);
  const [mediaStream, setMediaStream] = useState();
  let mediasoup;
  useEffect(() => {
    try {
    } catch (ex) {
      console.error(ex);
    }
  }, []);

  const events = {
    onBroadcastSuccess: (val) => {
      try {
        const temp = [...eventMsg];
        temp.push(val ? "onBroadcastSuccess" : "onBroadcastFail");
        setEventMsg([...temp]);
      } catch (error) {
        console.error("SoftPhone", "events", "onBroadcastSuccess", error);
      }
    },
    onJoinConferenceSuccess: (msg) => {
      try {
        const temp = [...eventMsg];
        temp.push(JSON.stringify(msg));
        setEventMsg([...temp]);
      } catch (error) {
        console.error("SoftPhone", "events", "onJoinConferenceSuccess", error);
      }
    },
    onConferenceSuccess: (msg) => {
      try {
        const temp = [...eventMsg];
        temp.push(JSON.stringify(msg));
        setEventMsg([...temp]);
        setRouterId(msg.routerId);
      } catch (error) {
        console.error("SoftPhone", "events", "onConferenceSuccess", error);
      }
    },
    onMyStream: (mStream) => {
      try {
        console.log("SoftPhone", "events", "onMyStream");
        setMediaStream(mStream);
      } catch (error) {
        console.error("SoftPhone", "events", "onMyStream", error);
      }
    },
    newConsumer: (consumer) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "newConsumer",
          `${JSON.stringify(consumer)}`
        );
        const temp = { ...consumers };
        temp[consumer.id] = consumer;
        setConsumers({ ...temp });
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
      }
    },
    closeConsumer: (id) => {
      try {
        console.log("SoftPhone", "events", "closeConsumer", `${id}`);
        const temp = { ...consumers };
        delete temp[id];
        setConsumers({ ...temp });
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
      }
    },
    newPeer: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "newPeer",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "newPeer", error);
      }
    },
    peerClosed: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "peerClosed",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "peerClosed", error);
      }
    },
    consumerClosed: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "consumerClosed",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "consumerClosed", error);
      }
    },
    consumerPaused: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "consumerPaused",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "consumerPaused", error);
      }
    },
    consumerResumed: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "consumerResumed",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "consumerResumed", error);
      }
    },
    consumerLayersChanged: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "consumerLayersChanged",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "consumerLayersChanged", error);
      }
    },
    activeSpeaker: (notification) => {
      try {
        console.log(
          "SoftPhone",
          "events",
          "activeSpeaker",
          `${JSON.stringify(notification)}`
        );
      } catch (error) {
        console.error("SoftPhone", "events", "activeSpeaker", error);
      }
    },
  };

  const clientInit = () => {
    setIsConsumer(true);
    setIsProducer(false);
    mediasoup = mediasoupSdk.client;
    mediasoup.initialize(events);
  };

  const serverInit = () => {
    setIsProducer(true);
    setIsConsumer(false);
    mediasoup = mediasoupSdk.server;
    mediasoup.initialize(events);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <ToolBar>
          <Typography color="inherit">
            Virtual Class Room
          </Typography>
        </ToolBar>
      </AppBar>

      <Grid container spacing={3}>
        <Grid item xs={12}></Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <ButtonGroup
              color="primary"
              aria-label="outlined primary button group"
            >
              <Button
                color={isProducer ? "secondary" : "primary"}
                onClick={() => {
                  serverInit();
                }}
              >
                Producer Initialization{" "}
              </Button>
              <Button>||</Button>
              <Button
                color={isConsumer ? "secondary" : "primary"}
                onClick={() => {
                  clientInit();
                }}
              >
                Consumer Initialization
              </Button>
            </ButtonGroup>
          </Paper>
        </Grid>

        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <TextField
              id="standard-full-width121212"
              label="conference Name"
              style={{ margin: 8 }}
              placeholder="conference Name"
              fullWidth
              variant="outlined"
              value={conferenceId}
              onChange={(e) => {
                setConferenceId(e.target.value);
              }}
            />
            {isProducer && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (!conferenceId) {
                    alert("Please Enter Conference Name");
                    return;
                  }
                  mediasoup.createConference(conferenceId, events);
                }}
              >
                Start Conference
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}></Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <TextField
              id="standard-full-width"
              label="Router Id"
              style={{ margin: 8 }}
              placeholder="Router Id"
              fullWidth
              variant="outlined"
              value={routerId}
              onChange={(e) => {
                if (isConsumer) setRouterId(e.target.value);
              }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}></Grid>

        {isProducer && routerId && (
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  Host View
                </Grid>
                <Grid item xs={12}>
                  <LocalVideo
                    id={"asffafsa"}
                    mediaStream={mediaStream}
                    onClick={() => console.log("---------------")}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}></Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            {Object.values(consumers).map((item) => {
              const stream = new MediaStream();
              stream.addTrack(item.track);
              return (
                <Grid key={item.id} item xs={3}>
                  <Paper className={classes.paper}>
                    <Participator
                      key={item.id}
                      id={item.id}
                      mediaStream={stream}
                      fullName={item.name}
                      status={"pending.."}
                      active={item.active}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Grid item xs={12}></Grid>

        {isProducer && routerId && (
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  Host View
                </Grid>

                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color={video ? "secondary" : "primary"}
                    onClick={() => {
                      setVideo(!video);
                    }}
                  >
                    Video
                  </Button>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    variant="contained"
                    color={audio ? "secondary" : "primary"}
                    onClick={() => {
                      setAudio(!audio);
                    }}
                  >
                    Audio
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (!mediasoup.producingMedia(video, audio)) {
                        alert("Fail To Create Producer ");
                      }
                    }}
                  >
                    Start
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

        {(isProducer || isConsumer) && routerId && (
          <Grid item xs={isConsumer ? 12 : 6}>
            <Paper className={classes.paper}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  Consumers
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (!conferenceId) {
                        alert("No Conference ID ");
                        return;
                      }
                      if (!routerId) {
                        alert("No Router ID ");
                        return;
                      }
                      if (!mediasoup.consumingMedia(conferenceId, routerId)) {
                        alert("Fail To Create Consumer ");
                      }
                    }}
                  >
                    Start
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </div>
  );
}
