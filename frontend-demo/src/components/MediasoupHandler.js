import { Device } from "mediasoup-client";
import { SocketClient } from "./SocketClient";

class MediasoupHandler {
  subscribeEvents = {};
  constructor(authToken, path) {
    this.mySignaling = new SocketClient(authToken, path);
    //this._dataConsumers = new Map();
    this.sendTransport = {};
    this.recvTransport = {};

    // Create a device (use browser auto-detection).
    this.device = new Device();
    this.routerRtpCapabilities = {};
    this.consumers = {};
    this.conferenceData = {};
  }

  createConference = async (name) => {
    try {
      const conferenceData = await this.mySignaling.request(
        "createConference",
        name
      );

      console.log(
        "MediasoupHandler",
        "createConference",
        `Conference Create Successfully. ${JSON.stringify(conferenceData)}`
      );
      this.conferenceData = conferenceData;
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createConference", error);
      return false;
    }
  };

  getRouterCapabilities = async () => {
    try {
      // Communicate with our server app to retrieve router RTP capabilities.
      const routerRtpCapabilities = await this.mySignaling.request(
        "getRouterCapabilities",
        null
      );

      console.log(
        "MediasoupHandler",
        "createSendTransport",
        `Communicate with our server app to retrieve router RTP capabilities. ${JSON.stringify(
          routerRtpCapabilities
        )}`
      );
      this.routerRtpCapabilities = routerRtpCapabilities;
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createSendTransport", error);
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
      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      } = await this.mySignaling.request("createTransport", {
        sctpCapabilities: this.device.sctpCapabilities,
      });

      this.transportSetting = {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      };
      console.log(
        "MediasoupHandler",
        "canProduceVideo",
        `Create a transport in the server for sending our media through it. ${JSON.stringify(
          this.transportSetting
        )}`
      );
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "canProduceVideo", error);
      return false;
    }
  };

  // Create the local representation of our server-side transport.
  createSendTransport = (transportSetting) => {
    try {
      const sendTransport = this.device.createSendTransport({
        id: transportSetting.id,
        iceParameters: transportSetting.iceParameters,
        iceCandidates: transportSetting.iceCandidates,
        dtlsParameters: transportSetting.dtlsParameters,
        sctpParameters: transportSetting.sctpParameters,
      });
      this.sendTransport = sendTransport;
      if (
        !this.initiateSendTransportListeners(
          this.sendTransport,
          this.mySignaling
        )
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
      const recvTransport = this.device.createRecvTransport({
        id: transportSetting.id,
        iceParameters: transportSetting.iceParameters,
        iceCandidates: transportSetting.iceCandidates,
        dtlsParameters: transportSetting.dtlsParameters,
        sctpParameters: transportSetting.sctpParameters,
      });
      this.recvTransport = recvTransport;
      if (
        !this.initiateRecvTransportListeners(
          this.sendTransport,
          this.mySignaling
        )
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
            await mySignaling.request("transport-connect", {
              transportId: sendTransport.id,
              dtlsParameters,
            });

            // Done in the server, tell our transport.
            callback();
          } catch (error) {
            // Something was wrong in server side.
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
            const { id } = await mySignaling.request("produce", {
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              appData,
            });

            // Done in the server, pass the response to our transport.
            callback({ id });
          } catch (error) {
            // Something was wrong in server side.
            errback(error);
          }
        }
      );

      // Set transport "producedata" event handler.
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
      );

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

  initiateRecvTransportListeners = (sendTransport, mySignaling) => {
    try {
      // Set transport "connect" event handler.
      sendTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          // Here we must communicate our local parameters to our remote transport.
          try {
            await mySignaling.request("transport-connect", {
              transportId: sendTransport.id,
              dtlsParameters,
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

  /* createProducer = async (room, sendTransport) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      const audioProducer = room.createProducer(audioTrack);
      const videoProducer = room.createProducer(videoTrack);
      audioProducer.send(sendTransport);
      videoProducer.send(sendTransport);
      console.log(
        "MediasoupHandler",
        "createProducer",
        `Recv Transporter Crate Successfully.`
      );
      return true;
    } catch (error) {
      console.error("MediasoupHandler", "createProducer", error);
      return false;
    }
  }; */

  initiateConference = async (conferenceName) => {
    try {
      console.group(
        `%c MediasoupHandler initiateConference  :  ${conferenceName}`,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );
      this.mySignaling.socket.on('notification', (notification) => {
        try {
          console.log(
            "MediasoupHandler",
            "createRoom",
            "notification",
            `New notification came from server: ${JSON.stringify(notification)}`
          );

          if (this.subscribeEvents[notification.method])
                this.subscribeEvents[notification.method](notification);
                
          /* switch (notification.method) {
            case 'newPeer': {
              
              break;
            }
            case 'peerClosed': {
              
              break;
            }
            case 'consumerClosed': {
              
              break;
            }
            case 'consumerPaused': {
              
              break;
            }
            case 'consumerResumed': {
              
              break;
            }
            case 'consumerLayersChanged': {
              
              break;
            }
            case 'activeSpeaker': {
              
              break;
            }            
            default: {
              break;
            }
          } */
        } catch (error) {
          console.error("MediasoupHandler", "initiateConference","notification", error);
        }
      });


      this.mySignaling.socket.on("request", async (request) => {
        try {
          console.log(
            "MediasoupHandler",
            "createRoom",
            "request",
            `New request came from server: ${JSON.stringify(request)}`
          );

          switch (request.event) {
            case "consume": {
              /* {
                event: "consume",
                data: {
                  producerId: producer.GetName(),
                  consumerId: cid,
                  kind: _consumer.kind,
                  rtpParameters: _consumer.rtpParameters,
                  type: _consumer.type,
                  appData: producer.GetUserData(),
                  producerPaused: consumer.producerPaused,
                }
              } */
              const consumer = await this.recvTransport.consume({
                producerId: request.data.producerId,
                consumerId: request.data.consumerId,
                kind: request.data.kind,
                rtpParameters: request.data.rtpParameters,
                type: request.data.type,
                appData: request.data.appData,
                producerPaused: request.data.producerPaused,
                //appData:Object.assign(Object.assign({}, appData), { peerId }) // Trick.
              });
              consumer.on("transportclose", () => {
                if (this.subscribeEvents["closeConsumer"])
                this.subscribeEvents["closeConsumer"](consumer.id);
                this.consumers.delete(consumer.id);
              });
              this.consumers[consumer.id] = consumer;
              if (this.subscribeEvents["newConsumer"])
                this.subscribeEvents["newConsumer"](consumer);
              break;
            }
            default: {
              break;
            }
          }
        } catch (error) {
          console.error("MediasoupHandler", "initiateConference","request", error);
        }
        
        
      });
      if (!(await this.createConference(conferenceName)))
        throw new Error("Fail To create Conference");

      if (!(await this.getRouterCapabilities()))
        throw new Error("Fail To getRouterCapabilities");

      if (!(await this.loadDeviceRTPCapabilities()))
        throw new Error("Fail To loadDeviceRTPCapabilities");

      if (!(await this.createTransport()))
        throw new Error("Fail To createTransport");

      if (!(await this.createSendTransport(this.transportSetting)))
        throw new Error("Fail To createSendTransport");

      if (!(await this.createRecvTransport(this.transportSetting)))
        throw new Error("Fail To createRecvTransport");

      console.log(
        "MediasoupHandler",
        "createRoom",
        `Initiate Conference Successfully. ${JSON.stringify(
          this.conferenceData
        )}`
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
      /* if (!this.subscribeEvents[event]) {
        this.subscribeEvents[event] = {};
      }
      this.subscribeEvents[event][subscriber] = handler; */

      
    },
    initiateConference: (conferenceName,events) => {
      try {
        this.subscribeEvents = events;
        this.initiateConference(conferenceName);
        return true;
      } catch (error) {
        console.error("MediasoupHandler", "initiateConference", error);
        return false;
      }
    },
  };
}

const mediasoupHandler = new MediasoupHandler("token", "path");
Object.freeze(mediasoupHandler);

export default mediasoupHandler;
