import { types as mediasoupTypes } from "mediasoup-client";
import { SocketClient } from "./SocketClient";

let producer: mediasoupTypes.Producer;
let consumer: mediasoupTypes.Consumer;
let capabilities: mediasoupTypes.RtpParameters;
let device: mediasoupTypes.Device;
let mySignaling: SocketClient;
let sendTransport: mediasoupTypes.Transport;
let recvTransport: mediasoupTypes.Transport;
let conferenceData: any;
let transportSetting: any;
let subscribeEvents: any;

class ServerHandle {
  constructor(path) {
    try {
      console.group(
        `%c MediasoupHandler ServerHandle `,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );

      mySignaling = new SocketClient(path,this.socketMessageListener);
      device = new mediasoupTypes.Device();
      sendTransport.on("connect", this.sendTransportConnect);
      sendTransport.on("produce", this.sendTransportProduce);
      sendTransport.on("routerclose", () =>
        this.communicatingActionsEvents("routerclose")
      );

      recvTransport.on("connect", this.recvTransportConnect);
      recvTransport.on("routerclose", () =>
        this.communicatingActionsEvents("routerclose-recv")
      );

      producer.on("transportclose", () =>
        this.communicatingActionsEvents("transportclose")
      );

      consumer.on("transportclose", () =>
        this.communicatingActionsEvents("transportclose-consumer")
      );
      consumer.on("producerclose", () =>
        this.communicatingActionsEvents("producerclose")
      );

      consumer.on("producerpause", () =>
        console.log(
          "ServerHandle",
          "Emitted when the associated producer is paused."
        )
      );
      consumer.on("producerresume", () =>
        console.log(
          "ServerHandle",
          "Emitted when the associated producer is resumed."
        )
      );
      consumer.on("score", () =>
        console.log("ServerHandle", "Emitted “score”.")
      );
      consumer.on("layerschange", (layers) =>
        console.log("ServerHandle", "layers ")
      );
      consumer.on("trace", (trace) => console.log("ServerHandle", trace));
    } catch (error) {
      console.error("ServerHandle", "constructor", error);
    }
  }

  socketMessageListener = {
    onConferenceCreate: async (msg) => {
      try {
        conferenceData = {
          conferenceId: msg.conferenceId,
          routerId: msg.routerId,
        };
        await this.getRouterCapabilities();
      } catch (error) {
        console.error("ServerHandle", "onConferenceCreate", error);
      }
    },
    onRouterCapability: async (msg) => {
      try {
        capabilities = msg.capability;
        if (!(await this.loadDeviceRTPCapabilities(capabilities)))
          throw new Error("Fail To loadDeviceRTPCapabilities");

        if (!(await this.SendCreateTransportRequest()))
          throw new Error("Fail To createTransport");
      } catch (error) {
        console.error("ServerHandle", "onRouterCapability", error);
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
      } catch (error) {
        console.error("ServerHandle", "onTransportCreate", error);
      }
    },
    onProducerCreate: (msg) => {
      try {
        conferenceData.producerId = msg.producerId;
      } catch (error) {
        console.error("ServerHandle", "onProducerCreate", error);
      }
    },
    onConsumerCreate: async (msg) => {
      try {
        consumer = await recvTransport.consume({
          id: msg.transportId,
          producerId: conferenceData.producerId,
          kind: msg.kind,
          rtpParameters: capabilities,
        });
        if (subscribeEvents["newConsumer"])
          subscribeEvents["newConsumer"](consumer);
      } catch (error) {
        console.error("ServerHandle", "onConsumerCreate", error);
      }
    },
  };

  // Create a transport in the server for sending our media through it.
  SendCreateTransportRequest = async () => {
    try {
      const reply = await mySignaling.request("transport-create", {
        conferenceId: conferenceData.conferenceId,
        type: "producer",
        routerId: conferenceData.routerId,
        capabilities: capabilities,
        sctpCapabilities: device.sctpCapabilities,
      });

      console.log(
        "ServerHandle",
        "createTransport",
        `transport-create Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }`
      );
      return reply;
    } catch (error) {
      console.error("ServerHandle", "createTransport", error);
      return false;
    }
  };

  getRouterCapabilities = async () => {
    try {
      // Communicate with our server app to retrieve router RTP capabilities.
      const reply = await mySignaling.request("router-capability", {
        routerId: conferenceData.routerId,
      });

      console.log(
        "ServerHandle",
        "getRouterCapabilities",
        `Get Router Capabilities Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }`
      );
      return reply;
    } catch (error) {
      console.error("ServerHandle", "getRouterCapabilities", error);
      return null;
    }
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
      console.log("ServerHandle", "communicatingActionsEvents");
    } catch (error) {
      console.error("ServerHandle", "communicatingActionsEvents", error);
    }
  };

  /*
  The client side application loads its mediasoup device by providing it with the RTP capabilities of the server side mediasoup router.
  */
  loadDeviceRTPCapabilities = async (routerRtpCapabilities) => {
    try {
      await device.load({ routerRtpCapabilities });
      console.log("ServerHandle", "LoadDeviceRTPCapabilities");
      return true;
    } catch (error) {
      console.error("ServerHandle", "LoadDeviceRTPCapabilities", error);
      return false;
    }
  };

  sendTransportProduce = async (
    { kind, rtpParameters, appData },
    callback,
    errback
  ) => {
    try {
      console.log("ServerHandle", "sendTransportProduce");

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
        "ServerHandle",
        "sendTransportProduce",
        `producer-create Request ${
          reply ? "Send Successfully" : "Fail to Send"
        }`
      );

      callback();
    } catch (error) {
      console.error("ServerHandle", "sendTransportProduce", error);
      errback();
    }
  };

  recvTransportConnect = async ({ dtlsParameters }, callback, errback) => {
    try {
      console.log("ServerHandle", "sendTransportConnect");

      await mySignaling.request("connectConsumerTransport", {
        conferenceId: conferenceData.conferenceId,
        type: "producer",
        routerId: conferenceData.routerId,
        transportId: transportSetting.transportId,
        capabilities: capabilities,
        dtlsParameters: dtlsParameters,
      });

      callback();
    } catch (error) {
      console.error("ServerHandle", "sendTransportConnect", error);
      errback();
    }
  };

  sendTransportConnect = async ({ dtlsParameters }, callback, errback) => {
    try {
      console.log("ServerHandle", "sendTransportConnect");

      await mySignaling.request("transport-connect", {
        conferenceId: conferenceData.conferenceId,
        type: "producer",
        routerId: conferenceData.routerId,
        transportId: transportSetting.transportId,
        capabilities: capabilities,
        dtlsParameters: dtlsParameters,
      });
      callback();
    } catch (error) {
      console.error("ServerHandle", "sendTransportConnect", error);
      errback();
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

      recvTransport = device.createRecvTransport({
        id: id,
        iceParameters: iceParameters,
        iceCandidates: iceCandidates,
        dtlsParameters: dtlsParameters,
        sctpParameters: sctpParameters,
      });

      console.log("ServerHandle", "creatingTransports");
      return true;
    } catch (error) {
      console.error("ServerHandle", "creatingTransports", error);
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

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          console.error("getUserMedia() failed:", err.message);
          throw err;
        }
        return stream;
      }

      const mStream: MediaStream = await getUserMedia();
      const track: MediaStreamTrack = mStream.getVideoTracks()[0];

      producer = await sendTransport.produce({
        track,
        encodings: [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });

      console.log(
        "ServerHandle",
        "producingMedia",
        `Recv Transporter Crate Successfully. ${JSON.stringify(producer)}`
      );
      return true;
    } catch (error) {
      console.error("ServerHandle", "producingMedia", error);
      return false;
    }
  };

  /*
  Once the receive transport is created, the client side application can consume multiple audio and video tracks on it. However the order is the opposite (here the consumer must be created in the server first).
  */
  consumingMedia = async () => {
    try {
      const reply = await mySignaling.request("consume", {
        conferenceId: conferenceData.conferenceId,
        kind: "video",
        routerId: conferenceData.routerId,
        transportId: transportSetting.transportId,
        rtpParams: capabilities,
      });

      console.log(
        "ServerHandle",
        "consumingMedia",
        `consume Request ${reply ? "Send Successfully" : "Fail to Send"}`
      );
      return reply;
    } catch (error) {
      console.error("ServerHandle", "consume", error);
      return false;
    }
  };
}

export default ServerHandle;
