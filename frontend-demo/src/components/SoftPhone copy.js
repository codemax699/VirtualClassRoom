import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import MediasoupHandler from "./MediasoupHandler";
import Participator from "./Participator";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

export default function SoftPhone() {
  const [Name, setName] = useState("");
  const classes = useStyles();
  const [consumers, setConsumers] = useState({});

  const events = {
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

  return (
    <Container fixed>
      <Box component="span" m={1}>
        <div className={classes.root}>
          <TextField
            id="outlined-basic"
            label="Outlined"
            variant="outlined"
            value={Name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              MediasoupHandler.Client.initiateConference(Name, events);
            }}
          >
            initiateConference
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              MediasoupHandler.Client.consume();
            }}
          >
            consume
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              MediasoupHandler.Client.producerCreate();
            }}
          >
            producerCreate
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              MediasoupHandler.Client.producerBroadcast();
            }}
          >
            producerBroadcast
          </Button>

          {Object.values(consumers).map((item) => {
            const stream = new MediaStream();
            stream.addTrack(item.track);
            return (
              <Participator
                key={item.id}
                id={item.id}
                mediaStream={stream}
                fullName={item.name}
                status={"pending.."}
                active={item.active}
              />
            );
          })}
        </div>
      </Box>
    </Container>
  );
}
