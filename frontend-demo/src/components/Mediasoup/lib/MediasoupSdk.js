import { types as mediasoupTypes } from "mediasoup-client";
import { SocketClient } from "./SocketClient";

let producer = {};
let consumer = {};
let capabilities = {};
let device = {};
let mySignaling = {};
let sendTransport = {};
let recvTransport = {};
let conferenceData = {};
let transportSetting = {};
let subscribeEvents = {};
let isConsuming = false;

class MediasoupSdk {
  constructor() {
    try {
      console.group(
        `%c MediasoupHandler MediasoupSdk `,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );
      /*  subscribeEvents = callBack;
      mySignaling = new SocketClient(this.socketMessageListener);
      device = new mediasoupTypes.Device(); */
    } catch (error) {
      console.error("MediasoupSdk", "constructor", error);
    }
  }

  initializeSDK = (callBack) => {
    try {
      console.group(
        `%c MediasoupHandler initializeSDK `,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );
      subscribeEvents = callBack;
      mySignaling = new SocketClient(this.socketMessageListener);
      device = new mediasoupTypes.Device();
      return true;
    } catch (error) {
      console.error("MediasoupSdk", "initializeSDK", error);
      throw error;
    }
  };
  socketMessageListener = {
    onConferenceCreate: async (msg) => {
      try {
        conferenceData = {
          conferenceId: msg.conferenceId,
          routerId: msg.routerId,
        };
        await this.signaling.getRouterCapabilities();
      } catch (error) {
        console.error("MediasoupSdk", "onConferenceCreate", error);
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](null);
      }
    },
    onRouterCapability: async (msg) => {
      try {
        capabilities = msg.capability;
        if (!(await this.loadDeviceRTPCapabilities(capabilities)))
          throw new Error("Fail To loadDeviceRTPCapabilities");

        if (!(await this.signaling.sendCreateTransportRequest()))
          throw new Error("Fail To createTransport");
      } catch (error) {
        console.error("MediasoupSdk", "onRouterCapability", error);
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](null);
      }
    },
    onTransportCreate: async (msg) => {
      try {
        transportSetting = msg;
        if (
          !(await this.creatingTransports({
            id: transportSetting.transportId,
            iceParameters: transportSetting.iceParameters,
            iceCandidates: transportSetting.iceCandidates,
            dtlsParameters: transportSetting.dtlsParameters,
            sctpParameters: transportSetting.sctpParameters,
          }))
        )
          throw new Error("Fail To createSendTransport");

        if (isConsuming) {
          this.signaling.consumingMedia();
          if (subscribeEvents["onJoinConferenceSuccess"]) {
            subscribeEvents["onJoinConferenceSuccess"](); //in this version only user can act as broadcaster or consumer
          }
          return;
        }

        if (!this.producingMedia()) throw new Error("Fail To producingMedia");
      } catch (error) {
        console.error("MediasoupSdk", "onTransportCreate", error);
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](null);
      }
    },
    onProducerCreate: (msg) => {
      try {
        conferenceData.producerId = msg.producerId;
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](producer.track);
      } catch (error) {
        console.error("MediasoupSdk", "onProducerCreate", error);
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](null);
      }
    },
    onConsumerCreate:  (msg) => {
      try {
        if(msg && msg.consumerDetails && msg.consumerDetails.consumers){
          msg.consumerDetails.consumers.map(async (item)=>{
            consumer = await recvTransport.consume({
              id: item.consumer.consumerId,
              producerId: item.producer.producerId,
              kind: item.consumer.kind,
              rtpParameters: item.consumer.rtpParameters,
            });
    
            consumer.on("transportclose", () =>
              this.communicatingActionsEvents("transportclose-consumer")
            );
            consumer.on("producerclose", () =>
              this.communicatingActionsEvents("producerclose")
            );
    
            consumer.on("producerpause", () =>
              console.log(
                "MediasoupSdk",
                "Emitted when the associated producer is paused."
              )
            );
            consumer.on("producerresume", () =>
              console.log(
                "MediasoupSdk",
                "Emitted when the associated producer is resumed."
              )
            );
            consumer.on("score", () =>
              console.log("MediasoupSdk", "Emitted “score”.")
            );
            consumer.on("layerschange", (layers) =>
              console.log("MediasoupSdk", "layers ")
            );
            consumer.on("trace", (trace) => console.log("MediasoupSdk", trace));
    
            if (subscribeEvents["newConsumer"])
              subscribeEvents["newConsumer"](consumer);
          });
        }else{
          console.error("MediasoupSdk", "onConsumerCreate-invalid data");
        }
        
        /* consumer = await recvTransport.consume({
          id: msg.transportId,
          producerId: conferenceData.producerId,
          kind: msg.kind,
          rtpParameters: capabilities,
        });

        consumer.on("transportclose", () =>
          this.communicatingActionsEvents("transportclose-consumer")
        );
        consumer.on("producerclose", () =>
          this.communicatingActionsEvents("producerclose")
        );

        consumer.on("producerpause", () =>
          console.log(
            "MediasoupSdk",
            "Emitted when the associated producer is paused."
          )
        );
        consumer.on("producerresume", () =>
          console.log(
            "MediasoupSdk",
            "Emitted when the associated producer is resumed."
          )
        );
        consumer.on("score", () =>
          console.log("MediasoupSdk", "Emitted “score”.")
        );
        consumer.on("layerschange", (layers) =>
          console.log("MediasoupSdk", "layers ")
        );
        consumer.on("trace", (trace) => console.log("MediasoupSdk", trace));

        if (subscribeEvents["newConsumer"])
          subscribeEvents["newConsumer"](consumer); */
      } catch (error) {
        console.error("MediasoupSdk", "onConsumerCreate", error);
      }
    },
    onMediaBroadcast: (msg) => {
      try {
        if (subscribeEvents["onBroadcastSuccess"])
          subscribeEvents["onBroadcastSuccess"](true);
      } catch (error) {
        console.error("MediasoupSdk", "onMediaBroadcast", error);
        if (subscribeEvents["onBroadcastSuccess"])
          subscribeEvents["onBroadcastSuccess"](false);
      }
    },
  };

  getSignaling = () => {
    return this.signaling;
  };
  signaling = {
    // Create a transport in the server for sending our media through it.
    sendCreateTransportRequest: async (type) => {
      try {
        const reply = await mySignaling.request("transport-create", {
          conferenceId: conferenceData.conferenceId,
          type: isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          capabilities: capabilities,
          sctpCapabilities: device.sctpCapabilities,
        });

        console.log(
          "MediasoupSdk",
          "createTransport",
          `transport-create Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "createTransport", error);
        return false;
      }
    },
    joinConference: async (conferenceId, routerId, callback) => {
      try {
        isConsuming = true;
        subscribeEvents["onJoinConferenceSuccess"] = callback;
        conferenceData.conferenceId = conferenceId;
        conferenceData.routerId = routerId;
        const reply = await this.signaling.getRouterCapabilities();
        console.log(
          "MediasoupSdk",
          "joinConference",
          `joinConference Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "joinConference", error);
        return null;
      }
    },
    getRouterCapabilities: async () => {
      try {
        // Communicate with our server app to retrieve router RTP capabilities.
        const reply = await mySignaling.request("router-capability", {
          routerId: conferenceData.routerId,
        });

        console.log(
          "MediasoupSdk",
          "getRouterCapabilities",
          `Get Router Capabilities Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "getRouterCapabilities", error);
        return null;
      }
    },

    sendTransportProduce: async (
      { kind, rtpParameters, appData },
      callback,
      errback
    ) => {
      try {
        console.log("MediasoupSdk", "sendTransportProduce");

        const reply = await mySignaling.request("producer-create", {
          conferenceId: conferenceData.conferenceId,
          kind,
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          rtpParams: rtpParameters,
          serverRtpParams: capabilities,
          appData,
        });

        console.log(
          "MediasoupSdk",
          "sendTransportProduce",
          `producer-create Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );

        callback();
      } catch (error) {
        console.error("MediasoupSdk", "sendTransportProduce", error);
        errback();
      }
    },

    recvTransportConnect: async ({ dtlsParameters }, callback, errback) => {
      try {
        console.log("MediasoupSdk", "sendTransportConnect");

        await mySignaling.request("connectConsumerTransport", {
          conferenceId: conferenceData.conferenceId,
          type: isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          capabilities: capabilities,
          dtlsParameters: dtlsParameters,
        });

        callback();
      } catch (error) {
        console.error("MediasoupSdk", "sendTransportConnect", error);
        errback();
      }
    },
    sendTransportConnect: async ({ dtlsParameters }, callback, errback) => {
      try {
        console.log("MediasoupSdk", "sendTransportConnect");

        await mySignaling.request("transport-connect", {
          conferenceId: conferenceData.conferenceId,
          type: isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          capabilities: capabilities,
          dtlsParameters: dtlsParameters,
        });
        callback();
      } catch (error) {
        console.error("MediasoupSdk", "sendTransportConnect", error);
        errback();
      }
    },

    /*
Once the receive transport is created, the client side application can consume multiple audio and video tracks on it. However the order is the opposite (here the consumer must be created in the server first).
*/
    consumingMedia: async () => {
      try {
        const reply = await mySignaling.request("consume", {
          conferenceId: conferenceData.conferenceId,
          kind: "video",
          routerId: conferenceData.routerId,
          transportId: transportSetting.transportId,
          rtpParams: capabilities,
        });

        console.log(
          "MediasoupSdk",
          "consumingMedia",
          `consume Request ${reply ? "Send Successfully" : "Fail to Send"}`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "consume", error);
        return false;
      }
    },
    createConference: async (name, callback) => {
      try {
        subscribeEvents["onConferenceSuccess"] = callback;
        const reply = await mySignaling.request("conference-create", {
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
    },
    producerBroadcast: async (callback) => {
      try {
        subscribeEvents["onBroadcastSuccess"] = callback;
        const reply = await mySignaling.request("producer-broadcast", {
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
  };

  /*
  When a transport, producer, consumer, data producer or data consumer is closed in client or server side (e.g. by calling close() on it), the application should signal its closure to the other side which should also call close() on the corresponding entity. In addition, the server side application should listen for the following closure events and notify the client about them:
  */

  communicatingActionsEvents = (event) => {
    try {
      switch (event) {
        case "routerclose":
        case "routerclose-recv": {
          console.log("router closed so transport closed");
          break;
        }
        case "transportclose": {
          console.log("transport closed so producer closed");
          break;
        }
        case "producerclose": {
          console.log("router closed so transport closed");
          break;
        }
        case "transportclose-consumer": {
          console.log("transport closed so consumer closed");
          break;
        }

        default: {
          break;
        }
      }
      console.log("MediasoupSdk", "communicatingActionsEvents");
    } catch (error) {
      console.error("MediasoupSdk", "communicatingActionsEvents", error);
    }
  };

  /*
  The client side application loads its mediasoup device by providing it with the RTP capabilities of the server side mediasoup router.
  */
  loadDeviceRTPCapabilities = async (routerRtpCapabilities) => {
    try {
      await device.load({ routerRtpCapabilities });
      console.log("MediasoupSdk", "LoadDeviceRTPCapabilities");
      return true;
    } catch (error) {
      console.error("MediasoupSdk", "LoadDeviceRTPCapabilities", error);
      return false;
    }
  };

  /*
  Both mediasoup-client and libmediasoupclient need separate WebRTC transports for sending and receiving. Typically, the client application creates those transports in advance, before even wishing to send or receive media.
  */

  creatingTransports = ({
    id,
    iceParameters,
    iceCandidates,
    dtlsParameters,
    sctpParameters,
  }) => {
    try {
      sendTransport = device.createSendTransport({
        id: id,
        iceParameters: iceParameters,
        iceCandidates: iceCandidates,
        dtlsParameters: dtlsParameters,
        sctpParameters: sctpParameters,
      });

      sendTransport.on("connect", this.signaling.sendTransportConnect);
      sendTransport.on("produce", this.signaling.sendTransportProduce);
      sendTransport.on("routerclose", () =>
        this.communicatingActionsEvents("routerclose")
      );

      recvTransport = device.createRecvTransport({
        id: id,
        iceParameters: iceParameters,
        iceCandidates: iceCandidates,
        dtlsParameters: dtlsParameters,
        sctpParameters: sctpParameters,
      });

      recvTransport.on("connect", this.signaling.recvTransportConnect);
      recvTransport.on("routerclose", () =>
        this.communicatingActionsEvents("routerclose-recv")
      );

      console.log("MediasoupSdk", "creatingTransports");
      return true;
    } catch (error) {
      console.error("MediasoupSdk", "creatingTransports", error);
      return false;
    }
  };

  /*
  Once the send transport is created, the client side application can produce multiple audio and video tracks on it.
  */
  producingMedia = async () => {
    try {
      async function getUserMedia() {
        if (!device.canProduce("video")) {
          console.error("cannot produce video");
          return;
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          console.error("getUserMedia() failed:", err.message);
          throw err;
        }
        return stream;
      }

      const mStream = await getUserMedia();
      const track = mStream.getVideoTracks()[0];

      //track, encodings, codecOptions, codec, stopTracks = true, zeroRtpOnPause = false, appData = {}

      producer = await sendTransport.produce({
        track: track,
        encodings: [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
        stopTracks: false
      });

      //,      codec:device.rtpCapabilities.codecs
      /* producer = await sendTransport.produce({
        track,
        encodings: [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
        codec:device.rtpCapabilities.codecs,
        stopTracks: false,
      }); */

      producer.on("transportclose", () =>
        this.communicatingActionsEvents("transportclose")
      );

      console.log(
        "MediasoupSdk",
        "producingMedia",
        `Recv Transporter Crate Successfully. ${JSON.stringify(producer)}`
      );
      if (subscribeEvents["onMyStream"])
      subscribeEvents["onMyStream"](mStream);
      return true;
    } catch (error) {
      console.error("MediasoupSdk", "producingMedia", error);
      return false;
    }
  };
}

export default MediasoupSdk;
