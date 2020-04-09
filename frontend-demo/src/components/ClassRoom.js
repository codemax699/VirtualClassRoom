import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import NotificationsIcon from "@material-ui/icons/Notifications";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

import Participator from "./Participator";
import mediasoup from "./Mediasoup/lib/index";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import InboxIcon from "@material-ui/icons/Inbox";
import LocalVideo from './LocalVideo';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
}));

export default function ClassRoom() {
  const classes = useStyles();
  const [conferenceId, setConferenceId] = useState("");
  const [routerId, setRouterId] = useState("");
  const [consumers, setConsumers] = useState({});
  const [isConsumer, setIsConsumer] = useState(false);
  const [eventMsg, setEventMsg] = useState(["--------------------------------"]);
  const [mediaStream, setMediaStream] = useState();

  const events = {
    onBroadcastSuccess:(val)=>{
      try {
        const temp = [...eventMsg];
        temp.push(val?'onBroadcastSuccess':'onBroadcastFail');
        setEventMsg([...temp]);
      } catch (error) {
        console.error("SoftPhone", "events", "onBroadcastSuccess", error);
      }
    },
    onJoinConferenceSuccess:(msg)=>{
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
    mediasoup.client.initialize(events);
  };

  const serverInit = () => {
    setIsConsumer(false);
    mediasoup.server.initialize(events);
  };

  return (
    <div className={classes.root}>
      <AppBar position="absolute">
        <Toolbar className={classes.toolbar}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Dashboard
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Views */}
            <Grid item xs={12} md={4} lg={12}>
              <Paper>
                <React.Fragment>
                  <Typography
                    component="h2"
                    variant="h6"
                    color="primary"
                    gutterBottom
                  >
                    View
                  </Typography>

                  {!isConsumer && (
                    <Grid item>
                      <LocalVideo id={"asffafsa"} mediaStream={mediaStream} onClick={()=>console.log('---------------')}/>  
                    </Grid>
                  )}
                  {isConsumer && (
                    <Grid item>
                      {Object.values(consumers).map((item) => {
                        const stream = new MediaStream();
                        stream.addTrack(item.track);
                        return (
                          <Grid item>
                            <Participator
                              key={item.id}
                              id={item.id}
                              mediaStream={stream}
                              fullName={item.name}
                              status={"pending.."}
                              active={item.active}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </React.Fragment>
              </Paper>
            </Grid>

            <Grid container item xs={12} md={6} lg={12} spacing={2}>
              <Grid item xs={12} md={3} lg={4}>
                <Paper>
                  <React.Fragment>
                    <Typography
                      component="h2"
                      variant="h6"
                      color="primary"
                      gutterBottom
                    >
                      Server
                    </Typography>
                    <Grid container spacing={2} justify="center">
                      <Grid item>
                        <TextField
                          id="outlined-basic"
                          label="Conference Id"
                          variant="outlined"
                          value={conferenceId}
                          onChange={(e) => {
                            setConferenceId(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            serverInit();
                          }}
                        >
                          server-Init
                        </Button>
                      </Grid>
                      <Grid container spacing={2} justify="center">
                        <Grid item>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              mediasoup.server.createConference(
                                conferenceId,
                                events
                              );
                            }}
                          >
                            create Conference
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              mediasoup.server.broadcast();
                            }}
                          >
                            broadcast
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Typography component="p" variant="h4"></Typography>
                  </React.Fragment>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={8}>
                <Paper>
                  <React.Fragment>
                    <Typography
                      component="h2"
                      variant="h6"
                      color="primary"
                      gutterBottom
                    >
                      Client
                    </Typography>
                    <Grid container spacing={2} justify="center">
                      <Grid item>
                        <TextField
                          id="outlined-basic"
                          label="Conference Id"
                          variant="outlined"
                          value={conferenceId}
                          onChange={(e) => {
                            setConferenceId(e.target.value);
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          id="outlined-basic"
                          label="Router Id"
                          variant="outlined"
                          value={routerId}
                          onChange={(e) => {
                            setRouterId(e.target.value);
                          }}
                        />
                      </Grid>

                      <Grid container spacing={2} justify="center">
                        <Grid item>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              clientInit();
                            }}
                          >
                            client-Init
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              mediasoup.client.joinConference(
                                conferenceId,
                                routerId,
                                events
                              );
                            }}
                          >
                            joinConference
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </React.Fragment>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <div className={classes.root}>
              <List component="nav" aria-label="main mailbox folders">
                <ListItem button>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary="dasdas" />
                </ListItem>

                {eventMsg.map((m) => {
                  return (
                    <ListItem button>
                      <ListItemIcon>
                        <InboxIcon />
                      </ListItemIcon>
                      <ListItemText primary={m} />
                    </ListItem>
                  );
                })}
              </List>
              <Divider />
            </div>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
