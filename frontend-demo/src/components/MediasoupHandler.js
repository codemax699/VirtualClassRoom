import { Device } from "mediasoup-client";
import { SocketClient } from "./SocketClient";

let sendTransport = {};
let recvTransport = {};
let routerRtpCapabilities = {};
let consumers = {};
let conferenceData = {};
let subscribeEvents = {};
let transportSetting = {};

class MediasoupHandler {
  constructor(authToken, path) {
    this.mySignaling = new SocketClient(this.messageProcessor, path);
    //this._dataConsumers = new Map();
    sendTransport = {};
    recvTransport = {};

    // Create a device (use browser auto-detection).
    this.device = new Device();

    routerRtpCapabilities = {};
    consumers = {};
    conferenceData = {};
    subscribeEvents = {};
  }

  messageProcessor = async (msgString) => {
    try {
      console.log("MediasoupHandler", "messageProcessor", `${msgString}`);
      const msg = JSON.parse(msgString);
      switch (msg.event) {
        case "conference-create": {
          conferenceData = {
            conferenceId: msg.conferenceId,
            routerId: msg.routerId,
          };
          if (!(await this.getRouterCapabilities()))
            throw new Error("Fail To getRouterCapabilities");

          break;
        }
        case "router-capability": {
          routerRtpCapabilities = {
            routerId: msg.routerId,
            capability: msg.capability,
          };
          if (!(await this.loadDeviceRTPCapabilities(routerRtpCapabilities.capability)))
            throw new Error("Fail To loadDeviceRTPCapabilities");

          if (!(await this.createTransport()))
            throw new Error("Fail To createTransport");
          break;
        }
        case "transport-create": {
          transportSetting = msg;
          if (!(await this.createSendTransport(transportSetting)))
            throw new Error("Fail To createSendTransport");
          if (!(await this.createRecvTransport(transportSetting)))
            throw new Error("Fail To createRecvTransport");
          break;
        }
        case "transport-connect": {
          break;
        }
        case "producer-create": {
          conferenceData.producerId = msg.producerId;
          break;
        }
        case "consumer-create": {

          /* const consumer = await transport.consume(
            {
              id            : data.id,
              producerId    : data.producerId,
              kind          : data.kind,
              rtpParameters : data.rtpParameters
            });
        
          // Render the remote video track into a HTML video element.
          const { track } = consumer;
        
          videoElem.srcObject = new MediaStream([ track ]); */

          const consumer = await this.recvTransport.consume({
            producerId: conferenceData.producerId,
            consumerId: msg.consumerId,
            //kind: request.data.kind,
            rtpParameters: routerRtpCapabilities,
            //type: request.data.type,
            // appData: request.data.appData,
            // producerPaused: request.data.producerPaused,
            conferenceId: msg.conferenceId,
            routerId: msg.routerId,
            transportId: msg.transportId,
          });
          consumer.on("transportclose", () => {
            if (subscribeEvents["closeConsumer"])
              subscribeEvents["closeConsumer"](consumer.id);
            consumers.delete(consumer.id);
          });
          consumers[consumer.id] = consumer;
          if (subscribeEvents["newConsumer"])
            subscribeEvents["newConsumer"](consumer);
          break;
        }
        case "media-broadcast": {
          break;
        }
        case "activeSpeaker": {
          break;
        }
        case "consumerClosed": {
          if (subscribeEvents["closeConsumer"])
            subscribeEvents["closeConsumer"](msg.data.consumerId);
          consumers.delete(msg.data.consumerId);
          break;
        }
        case "consumerPaused": {
          break;
        }
        case "consumerResumed": {
          break;
        }
        case "consumerScore": {
          break;
        }
        case "producerScore": {
          break;
        }
        case "layerChanged": {
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      console.error("MediasoupHandler", "messageProcessor", error);
    }
  };
  createConference = async (name) => {
    try {
      const reply = await this.mySignaling.request("conference-create", {
        conferenceId: name,
      });

      console.log(
        "MediasoupHandler",
        "createConference",
        `Conference Create Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }. ${name}`
      );
      return reply;
    } catch (error) {
      console.error("MediasoupHandler", "createConference", error);
      return false;
    }
  };

  getRouterCapabilities = async () => {
    try {
      // Communicate with our server app to retrieve router RTP capabilities.
      const reply = await this.mySignaling.request("router-capability", {
        routerId: conferenceData.routerId,
      });

      console.log(
        "MediasoupHandler",
        "getRouterCapabilities",
        `Get Router Capabilities Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }`
      );
      return reply;
    } catch (error) {
      console.error("MediasoupHandler", "getRouterCapabilities", error);
      return null;
    }
  };

  loadDeviceRTPCapabilities = async (routerRtpCapabilities) => {
    try {
      // Load the device with the router RTP capabilities.
      await this.device.load({ routerRtpCapabilities });

      console.log("MediasoupHandler", "LoadDeviceRTPCapabilities");
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "LoadDeviceRTPCapabilities", error);
      return false;
    }
  };

  // Check whether we can produce video to the router.
  canProduceVideo = () => {
    try {
      const status = this.device.canProduce("video");
      console.log(
        "MediasoupHandler",
        "canProduceVideo",
        `Check whether we can produce video to the router. ${
          status ? "can produce video" : "cannot produce video"
        }`
      );
      return status;
    } catch (error) {
      console.error("MediasoupHandler", "canProduceVideo", error);
      return false;
    }
  };

  // Create a transport in the server for sending our media through it.
  createTransport = async () => {
    try {
      const reply = await this.mySignaling.request("transport-create", {
        conferenceId: conferenceData.conferenceId,
        type: "producer",
        routerId: conferenceData.routerId,
        capabilities: routerRtpCapabilities,
        sctpCapabilities: this.device.sctpCapabilities,
      });

      console.log(
        "MediasoupHandler",
        "createTransport",
        `transport-create Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }`
      );
      return reply;
    } catch (error) {
      console.error("MediasoupHandler", "createTransport", error);
      return false;
    }
  };

  // Create the local representation of our server-side transport.
  createSendTransport = (transportSetting) => {
    try {
      const transport = this.device.createSendTransport({
        id: transportSetting.transportId,
        iceParameters: transportSetting.iceParameters,
        iceCandidates: transportSetting.iceCandidates,
        dtlsParameters: transportSetting.dtlsParameters,
        sctpParameters: transportSetting.sctpParameters,
      });
      sendTransport = transport;
      if (
        !this.initiateSendTransportListeners(sendTransport, this.mySignaling)
      ) {
        throw new Error("Fail To Initiate Send Transport Listeners");
      }
      console.log(
        "MediasoupHandler",
        "createSendTransport",
        `Send Transporter Crate Successfully. ${JSON.stringify(sendTransport)}`
      );
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createSendTransport", error);
      return false;
    }
  };

  createRecvTransport = (transportSetting) => {
    try {
      const transport = this.device.createRecvTransport({
        id: transportSetting.transportId,
        iceParameters: transportSetting.iceParameters,
        iceCandidates: transportSetting.iceCandidates,
        dtlsParameters: transportSetting.dtlsParameters,
        sctpParameters: transportSetting.sctpParameters,
      });
      recvTransport = transport;
      if (
        !this.initiateRecvTransportListeners(sendTransport, this.mySignaling)
      ) {
        throw new Error("Fail To Initiate Recv Transport Listeners");
      }
      console.log(
        "MediasoupHandler",
        "createSendTransport",
        `Send Transporter Crate Successfully. ${JSON.stringify(recvTransport)}`
      );
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createSendTransport", error);
      return false;
    }
  };

  initiateSendTransportListeners = (sendTransport, mySignaling) => {
    try {
      // Set transport "connect" event handler.
      sendTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            console.log(
              "MediasoupHandler",
              "initiateSendTransportListeners",
              "sendTransport",
              "connect"
            );

            await mySignaling.request("transport-connect", {
              conferenceId: conferenceData.conferenceId,
              type: "producer",
              routerId: conferenceData.routerId,
              transportId: transportSetting.transportId,
              capabilities: routerRtpCapabilities,
              dtlsParameters: dtlsParameters,
            });

            // Done in the server, tell our transport.
            callback();
          } catch (error) {
            console.error(
              "MediasoupHandler",
              "initiateSendTransportListeners",
              "connect",
              error
            );
            errback(error);
          }
        }
      );

      // Set transport "produce" event handler.
      sendTransport.on(
        "produce",
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            console.log(
              "MediasoupHandler",
              "initiateSendTransportListeners",
              "sendTransport",
              "produce"
            );

            const reply = await this.mySignaling.request("producer-create", {
              conferenceId: conferenceData.conferenceId,
              kind,
              routerId: conferenceData.routerId,
              transportId: transportSetting.transportId,
              rtpParams: rtpParameters,
              serverRtpParams: routerRtpCapabilities,
              appData
            });

            console.log(
              "MediasoupHandler",
              "produce",
              `producer-create Request ${
                reply ? "Send Successfully" : "Fail to Send"
              }`
            );

            // Done in the server, pass the response to our transport.
            callback({ id: transportSetting.transportId });
          } catch (error) {
            console.error(
              "MediasoupHandler",
              "initiateSendTransportListeners",
              "produce",
              error
            );
            errback(error);
          }
        }
      );

      /* // Set transport "producedata" event handler.
      sendTransport.on(
        "producedata",
        async (
          { sctpStreamParameters, label, protocol, appData },
          callback,
          errback
        ) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            const { id } = await mySignaling.request("produceData", {
              transportId: sendTransport.id,
              sctpStreamParameters,
              label,
              protocol,
              appData,
            });

            // Done in the server, pass the response to our transport.
            callback({ id });
          } catch (error) {
            // Something was wrong in server side.
            errback(error);
          }
        }
      ); */

      console.log(
        "MediasoupHandler",
        "initiateSendTransportListeners",
        `Initiate SendTransport Listeners Successfully.`
      );
      return true;
    } catch (error) {
      console.error(
        "MediasoupHandler",
        "initiateSendTransportListeners",
        error
      );
      return false;
    }
  };

  initiateRecvTransportListeners = (recvTransport, mySignaling) => {
    try {
      // Set transport "connect" event handler.
      recvTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            console.log(
              "MediasoupHandler",
              "initiateRecvTransportListeners",
              "recvTransport",
              "connect"
            );

            await mySignaling.request("connectConsumerTransport", {
              conferenceId: conferenceData.conferenceId,
              type: "producer",
              routerId: conferenceData.routerId,
              transportId: transportSetting.transportId,
              capabilities: routerRtpCapabilities,
              dtlsParameters: dtlsParameters,
            });

            // Done in the server, tell our transport.
            callback();
          } catch (error) {
            // Something was wrong in server side.
            errback(error);
          }
        }
      );

      console.log(
        "MediasoupHandler",
        "initiateRecvTransportListeners",
        `Initiate Recv Transport Listeners Successfully.`
      );
      return true;
    } catch (error) {
      console.error(
        "MediasoupHandler",
        "initiateRecvTransportListeners",
        error
      );
      return false;
    }
  };

  createProducer = async () => {
    try {
      /* const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      const audioProducer = room.createProducer(audioTrack);
      const videoProducer = room.createProducer(videoTrack);
      audioProducer.send(sendTransport);
      videoProducer.send(sendTransport);

 */
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true,
        video: true });
      const webcamTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      const webcamProducer = await sendTransport.produce({
        track: webcamTrack,
      });

      console.log(
        "MediasoupHandler",
        "createProducer",
        `Recv Transporter Crate Successfully. ${JSON.stringify(webcamProducer)}`
      );
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createProducer", error);
      return false;
    }
  };

  initiateConference = async (conferenceName) => {
    try {
      console.group(
        `%c MediasoupHandler initiateConference  :  ${conferenceName}`,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );

      /* this.mySignaling.socket.on("notification", (notification) => {
        try {
          console.log(
            "MediasoupHandler",
            "createRoom",
            "notification",
            `New notification came from server: ${JSON.stringify(notification)}`
          );

          if (subscribeEvents[notification.method])
            subscribeEvents[notification.method](notification);
         
        } catch (error) {
          console.error(
            "MediasoupHandler",
            "initiateConference",
            "notification",
            error
          );
        }
      }); */

      /* this.mySignaling.socket.on("request", async (request) => {
        try {
          console.log(
            "MediasoupHandler",
            "createRoom",
            "request",
            `New request came from server: ${JSON.stringify(request)}`
          );

          switch (request.event) {
            case "consume": {
              
              const consumer = await recvTransport.consume({
                producerId: request.data.producerId,
                consumerId: request.data.consumerId,
                kind: request.data.kind,
                rtpParameters: request.data.rtpParameters,
                type: request.data.type,
                appData: request.data.appData,
                producerPaused: request.data.producerPaused
              });
              consumer.on("transportclose", () => {
                if (subscribeEvents["closeConsumer"])
                  subscribeEvents["closeConsumer"](consumer.id);
                consumers.delete(consumer.id);
              });
              consumers[consumer.id] = consumer;
              if (subscribeEvents["newConsumer"])
                subscribeEvents["newConsumer"](consumer);
              break;
            }
            default: {
              break;
            }
          }
        } catch (error) {
          console.error(
            "MediasoupHandler",
            "initiateConference",
            "request",
            error
          );
        }
      }); */
      if (!(await this.createConference(conferenceName)))
        throw new Error("Fail To create Conference");

      /* if (!(await this.getRouterCapabilities()))
        throw new Error("Fail To getRouterCapabilities");

      if (!(await this.loadDeviceRTPCapabilities()))
        throw new Error("Fail To loadDeviceRTPCapabilities");

      if (!(await this.createTransport()))
        throw new Error("Fail To createTransport");

      if (!(await this.createSendTransport(this.transportSetting)))
        throw new Error("Fail To createSendTransport");

      if (!(await this.createRecvTransport(this.transportSetting)))
        throw new Error("Fail To createRecvTransport"); */

      console.log(
        "MediasoupHandler",
        "createRoom",
        `Initiate Conference Successfully. ${JSON.stringify(conferenceData)}`
      );
      console.groupEnd();
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createRoom", error);
      console.groupEnd();
      return false;
    }
  };

  Client = {
    subscribeEvent: (subscriber, event, handler) => {
      /* if (!subscribeEvents[event]) {
        subscribeEvents[event] = {};
      }
      subscribeEvents[event][subscriber] = handler; */
    },
    initiateConference: (conferenceName, events) => {
      try {
        subscribeEvents = events;
        this.initiateConference(conferenceName);
        return true;
      } catch (error) {
        console.error("MediasoupHandler", "initiateConference", error);
        return false;
      }
    },
    producerCreate: async () => {
      try {
        await this.createProducer();
        /* const reply = await this.mySignaling.request("producer-create", {
          conferenceId: conferenceData.conferenceId,
          kind: "video",
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          rtpParams: this.device.rtpCapabilities,
          serverRtpParams: routerRtpCapabilities
        }); */
        console.log(
          "MediasoupHandler",
          "producerCreate",
          `producerCreate Request ${
            true ? "Send Successfully" : "Fail to Send"
          }`
        );
        return true;
      } catch (error) {
        console.error("MediasoupHandler", "producerBroadcast", error);
        return false;
      }
    },
    producerBroadcast: async () => {
      try {
        const reply = await this.mySignaling.request("producer-broadcast", {
          conferenceId: conferenceData.conferenceId,
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          producerId: conferenceData.producerId,
        });

        console.log(
          "MediasoupHandler",
          "producerBroadcast",
          `producerBroadcast Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupHandler", "producerBroadcast", error);
        return false;
      }
    },
    consume: async () => {
      try {
        const reply = await this.mySignaling.request("consume", {
          conferenceId: conferenceData.conferenceId,
          kind: "video",
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          rtpParams: routerRtpCapabilities,
        });

        console.log(
          "MediasoupHandler",
          "consume",
          `consume Request ${reply ? "Send Successfully" : "Fail to Send"}`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupHandler", "consume", error);
        return false;
      }
    },
  };
}

const mediasoupHandler = new MediasoupHandler(
  "token",
  "ws://b16df8d2.ngrok.io"
);
Object.freeze(mediasoupHandler);

export default mediasoupHandler;
