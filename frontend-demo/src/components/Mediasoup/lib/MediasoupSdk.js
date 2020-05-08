import { types as mediasoupTypes } from "mediasoup-client";
import { SocketClient } from "./SocketClient";

let producers = {};
let consumer = {};
let capabilities = {};
let device = {};
let mySignaling = {};
let sendTransport = {};
let recvTransport = {};
let conferenceData = {};
let sendTransportSetting = {};
let recvTransportSetting = {};
let subscribeEvents = {};
let isConsuming = false;
let sendTransportProduceEvent = {};
let consumerMedia = {};
let consumerScreenMedia = {};


class MediasoupSdk {
  constructor() {
    try {
      console.group(
        `%c MediasoupHandler MediasoupSdk `,
        "color:#FF00FF; font-family:'Ubuntu'; display: block;font-weight:bold; font-size:18px;background: #34eb4f;"
      );
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
        // transportSetting = msg;
        if (
          !(await this.creatingTransports({
            id: msg.transportId,
            iceParameters: msg.iceParameters,
            iceCandidates: msg.iceCandidates,
            dtlsParameters: msg.dtlsParameters,
            sctpParameters: msg.sctpParameters,
          }))
        )
          throw new Error("Fail To createSendTransport");

        if (isConsuming) {
          recvTransportSetting = msg;
          this.signaling.consumingMedia("video");
          this.signaling.consumingMedia("audio");
          if (subscribeEvents["onJoinConferenceSuccess"]) {
            subscribeEvents["onJoinConferenceSuccess"](); //in this version only user can act as broadcaster or consumer
          }
          return;
        } else {
          sendTransportSetting = msg;
          msg.routerId = conferenceData.routerId;
          if (subscribeEvents["onConferenceSuccess"])
            subscribeEvents["onConferenceSuccess"](msg);
        }
      } catch (error) {
        console.error("MediasoupSdk", "onTransportCreate", error);
        if (subscribeEvents["onConferenceSuccess"])
          subscribeEvents["onConferenceSuccess"](null);
      }
    },
    onProducerCreate: (msg) => {
      try {
        // conferenceData.producerId = msg.producerId;
        conferenceData.producerId = msg.rawId;

        if (sendTransportProduceEvent.callback)
          sendTransportProduceEvent.callback({ id: msg.producerId });
      } catch (error) {
        console.error("MediasoupSdk", "onProducerCreate", error);
        if (sendTransportProduceEvent.errback)
          sendTransportProduceEvent.errback();
      }
    },
    onConsumerCreate: (msg) => {
      try {
        if (msg && msg.consumerDetails && msg.consumerDetails.consumers) {
          msg.consumerDetails.consumers.map(async (item) => {
            consumer = await recvTransport.consume({
              /* id: item.consumer.consumerId,
              producerId: item.producer.producerId, */
              id: item.consumer.rawId,
              producerId: item.producer.rawId,
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

            if (subscribeEvents["newConsumer"]) {
              consumer.consumerId = item.consumer.consumerId;
              consumer.data = item.producer.appData;
              subscribeEvents["newConsumer"](
                item.producer.transportId,
                consumer
              );
            }

            const id = item.producer.transportId;
            let stream = new MediaStream();
            stream.addTrack(consumer.track);
            let kind = consumer.kind;
            if (consumer.data) {
              kind = consumer.data.mediaTag;
            }

            let newConsumer = { stream, id, kind, consumerData: item };
            let temp = kind==="screen"?consumerScreenMedia[id]:consumerMedia[id];
            if (!temp) temp = {};
            if (!temp[kind]) temp[kind] = {};
            temp[kind] = newConsumer;          

            if(kind==="screen"){
              consumerScreenMedia[id] = temp;
              if (subscribeEvents["onConsumerScreenAdded"]) {
                subscribeEvents["onConsumerScreenAdded"](consumerScreenMedia);
              }
            }else{
              consumerMedia[id] = temp;
              if (subscribeEvents["onConsumerMediaAdded"]) {
                subscribeEvents["onConsumerMediaAdded"](consumerMedia);
              }
            }
            
          });
        } else {
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
    onConsumerAdded:(arg)=>{
        console.log(JSON.stringify(arg));
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
    activeSpeaker: (arg) => {
      /*  if (subscribeEvents["activeSpeaker"])
          subscribeEvents["activeSpeaker"](arg); */
    },
    consumerClosed: (arg) => {
      if (subscribeEvents["consumerClosed"])
        subscribeEvents["consumerClosed"](arg);
    },
    consumerPaused: (arg) => {
      if (subscribeEvents["consumerPaused"])
        subscribeEvents["consumerPaused"](arg);
    },
    consumerResumed: (arg) => {
      if (subscribeEvents["consumerResumed"])
        subscribeEvents["consumerResumed"](arg);
    },
  };

  getSignaling = () => {
    return this.signaling;
  };
  signaling = {
    sendMediaOperationRequest: async (operation, id) => {
      try {
        const reply = await mySignaling.request("media-operation", {
          conferenceId: conferenceData.conferenceId,
          type: "producer", // isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          mediaId: id,
          mediaType: "producer", // isConsuming ? "consumer" : "producer",
          mediaOperation: operation,
          otype: operation,
        });

        console.log(
          "MediasoupSdk",
          "sendMediaOperationRequest",
          `send Media Operation  Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "sendMediaOperationRequest", error);
        return false;
      }
    },
    sendMediaCloseRequest: async (id) => {
      try {
        const reply = await mySignaling.request("media-close", {
          conferenceId: conferenceData.conferenceId,
          type: isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          mediaId: id,
          otype: "producer", // isConsuming ? "consumer" : "producer",
          mediaOperation: "producer",
        });

        console.log(
          "MediasoupSdk",
          "sendMediaCloseRequest",
          `send Media Close   Request ${
            reply ? "Send Successfully" : "Fail to Send"
          }`
        );
        return reply;
      } catch (error) {
        console.error("MediasoupSdk", "sendMediaCloseRequest", error);
        return false;
      }
    },
    // Create a transport in the server for sending our media through it.
    sendCreateTransportRequest: async () => {
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
        sendTransportProduceEvent = { callback, errback };

        /* const data = await socket.request('createProducerTransport', {
          forceTcp: false,
          rtpCapabilities: device.rtpCapabilities,
        }); */
        const reply = await mySignaling.request("producer-create", {
          conferenceId: conferenceData.conferenceId,
          kind,
          routerId: conferenceData.routerId,
          transportId: sendTransportSetting.transportId,
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

        // callback();
      } catch (error) {
        console.error("MediasoupSdk", "sendTransportProduce", error);
        // errback();
      }
    },

    recvTransportConnect: async ({ dtlsParameters }, callback, errback) => {
      try {
        console.log("MediasoupSdk", "recvTransportConnect");

        await mySignaling.request("transport-connect", {
          conferenceId: conferenceData.conferenceId,
          type: isConsuming ? "consumer" : "producer",
          routerId: conferenceData.routerId,
          transportId: recvTransportSetting.transportId,
          capabilities: capabilities,
          dtlsParameters: dtlsParameters,
        });

        callback();
      } catch (error) {
        console.error("MediasoupSdk", "recvTransportConnect", error);
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
          transportId: sendTransportSetting.transportId,
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
    consumingMedia: async (kind) => {
      try {
        const reply = await mySignaling.request("consume", {
          conferenceId: conferenceData.conferenceId,
          kind: kind,
          routerId: conferenceData.routerId,
          transportId: recvTransportSetting.transportId,
          rtpParams: capabilities,
          consumeType: kind,
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

    /* startConsumingMedia: async (kind) => {
      try {
        isConsuming = true;
        return await this.signaling.sendCreateTransportRequest();
      } catch (error) {
        console.error("MediasoupSdk", "startConsumingMedia", error);
        return false;
      }
    }, */
    createConference: async (name) => {
      try {
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
    producerBroadcast: async () => {
      try {
        const reply = await mySignaling.request("producer-broadcast", {
          conferenceId: conferenceData.conferenceId,
          routerId: conferenceData.routerId,
          transportId: sendTransportSetting.transportId,
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
      if (isConsuming) {
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

        recvTransport.on("connectionstatechange", (state) => {
          console.log(
            "MediasoupSdk",
            "creatingTransports",
            "RecvTransport",
            "connectionstatechange",
            `${state}`
          );
        });

        console.log(
          "MediasoupSdk",
          "creatingTransports",
          "RecvTransport",
          `RecvTransport : ${JSON.stringify(recvTransport)}`
        );
      } else {
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
        sendTransport.on("connectionstatechange", (state) => {
          console.log(
            "MediasoupSdk",
            "creatingTransports",
            "sendTransport",
            "connectionstatechange",
            `${state}`
          );
        });

        console.log(
          "MediasoupSdk",
          "creatingTransports",
          "sendTransport",
          `sendTransport : ${JSON.stringify(sendTransport)}`
        );
      }
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
  producingMedia = async (kind) => {
    try {
      async function getUserMedia() {
        if (
          !device.canProduce(
            kind === "video" || kind === "screen" ? "video" : kind
          )
        ) {
          console.error(`cannot produce ${kind}`);
          return;
        }

        const m = {
          video: kind === "video" || kind === "screen",
          audio: kind === "audio",
        };

        let stream;
        try {
          stream =
            kind === "screen"
              ? navigator.mediaDevices.getDisplayMedia(m)
              : await navigator.mediaDevices.getUserMedia(m);
        } catch (err) {
          console.error("getUserMedia() failed:", err.message);
          throw err;
        }
        return stream;
      }

      const mStream = await getUserMedia();
      const track =
        kind === "video" || kind === "screen"
          ? mStream.getVideoTracks()[0]
          : mStream.getAudioTracks()[0];

      //track, encodings, codecOptions, codec, stopTracks = true, zeroRtpOnPause = false, appData = {}

      let options = {
        track: track,
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
        stopTracks: true,
        appData: { mediaTag: kind },
      };
      if (kind === "video") {
        options.encodings = [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 },
        ];
      }
      /* if(kind === "screen")        
        options.appData={ mediaTag: 'screen' } */

      producers[kind] = await sendTransport.produce(options);

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

      producers[kind].on("transportclose", () =>
        this.communicatingActionsEvents("transportclose")
      );

      console.log(
        "MediasoupSdk",
        "producingMedia",
        `Recv Transporter Crate Successfully. ${JSON.stringify(
          producers[kind]
        )}`
      );
      if (subscribeEvents["onMyStream"])
        subscribeEvents["onMyStream"](kind, mStream);
      return true;
    } catch (error) {
      console.error("MediasoupSdk", "producingMedia", error);
      return false;
    }
  };

  transportHandle = {
    /*Provides the underlying peerconnection with a new list of TURN servers.*/
    updateIceServers: () => {
      //  await transport.updateIceServers({ iceServers: [ ... ] });
    },

    /*Instructs the underlying peerconnection to restart ICE by providing it with new remote ICE parameters.*/
    restartIce: () => {
      // transport.restartIce({ iceParameters })
    },

    /*Gets the local transport statistics by calling getStats() in the underlying RTCPeerConnection instance.*/
    getStats: () => {
      //  transport.getStats()
    },

    /*Closes the transport, including all its producers and consumers.*/
    close: () => {
      //  transport.close();
    },
  };

  producerHandle = {
    createConference: async (conferenceName) => {
      try {
        if (!(await this.signaling.createConference(conferenceName)))
          throw new Error("Fail To create Conference");
        console.log(
          "MediasoupHandler",
          "createRoom",
          `Initiate Conference Successfully. ${JSON.stringify(conferenceData)}`
        );
        return true;
      } catch (error) {
        console.error("MediasoupHandler", "createRoom", error);

        return false;
      }
    },
    publishMedia: async (kind, conferenceId = null, routerId = null) => {
      isConsuming = false;
      if (conferenceId && routerId) {
        conferenceData = {
          conferenceId: conferenceId,
          routerId: routerId,
        };
        const temp = subscribeEvents["onConferenceSuccess"];
        subscribeEvents["onConferenceSuccess"] = async () => {
          subscribeEvents["onConferenceSuccess"] = temp;
          return await this.producingMedia(kind);
        };
        await this.signaling.getRouterCapabilities();
      } else {
        return await this.producingMedia(kind);
      }
    },
    consumingMedia: async (kind) => {
      //return await this.signaling.startConsumingMedia(kind);
      try {
        isConsuming = true;
        return await this.signaling.sendCreateTransportRequest();
      } catch (error) {
        console.error(
          "MediasoupSdk",
          "producerHandle",
          "startConsumingMedia",
          error
        );
        return false;
      }
    },
    /*Closes the producer. No more media is transmitted. The producer's track is internally stopped by calling stop() on it, meaning that it becomes no longer usable.*/
    close: (kind) => {
      const pro = producers[kind];
      if (pro) {
        pro.close();
        return this.signaling.sendMediaCloseRequest(pro.id);
      }
      return false;
    },

    /*Gets the local RTP sender statistics by calling getStats() in the underlying RTCRtpSender instance.*/
    getStats: () => {
      //  producer.getStats();
    },

    /*Pauses the producer (no RTP is sent to the server).*/
    pause: (kind) => {
      const pro = producers[kind];
      if (pro) {
        pro.pause();
        return this.signaling.sendMediaOperationRequest("pause", pro.id);
      }
      return false;
    },

    /*Resumes the producer (RTP is sent again to the server).*/
    resume: (kind) => {
      const pro = producers[kind];
      if (pro) {
        pro.resume();
        return this.signaling.sendMediaOperationRequest("resume", pro.id);
      }
      return false;
    },

    /*Replaces the audio or video track being transmitted. No negotiation with the server is needed.*/
    replaceTrack: (track) => {
      /* const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = stream.getVideoTracks()[0];
        await producer.replaceTrack({ track: newVideoTrack });     */
      //  producer.replaceTrack({ track })
    },

    /*In case of simulcast, this method limits the highest RTP stream being transmitted to the server.*/
    setMaxSpatialLayer: (spatialLayer) => {
      //  producer.setMaxSpatialLayer(spatialLayer);
    },

    /*Add parameters to all encodings in the RTCRtpSender of the producer. Use with caution.*/
    setRtpEncodingParameters: (params) => {
      //  producer.setRtpEncodingParameters(params);
    },
    /* operation: (command) => {
      if (command === "close") {
        return this.signaling.sendMediaCloseRequest();
      }
      return this.signaling.sendMediaOperationRequest(command);
    } */
  };

  consumerHandle = {
    joinConference: async (conferenceId, routerId) => {
      try {
        isConsuming = true;
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
        return false;
      }
    },
    /*Closes the consumer.*/
    close: () => {
      consumer.close();
      return true;
    },
    /* Gets the local RTP receiver statistics by calling getStats() in the underlying RTCRtpReceiver instance*/
    getStats: () => {
      consumer.getStats();
    },
    /*Pauses the consumer. Internally the library sets track.enabled = false in the remote track.*/
    pause: () => {
      consumer.pause();
      return true;
    },
    /*Resumes the consumer Internally the library sets track.enabled = true in the remote track.*/
    resume: () => {
      consumer.resume();
      return true;
    },
  };
}

export default MediasoupSdk;
