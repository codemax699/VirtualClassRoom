import MediasoupSdk from "./MediasoupSdk";

class index extends MediasoupSdk {
  constructor() {
    // call the MediasoupSdk constructor
    super();
  }

  initialize = (callBackEvents) => {
    try {
      console.log("MediasoupServer", "createConference");
      return this.initializeSDK(callBackEvents);
    } catch (error) {
      console.error("MediasoupServer", "createConference", error);
      return false;
    }
  };

  createConference = (name) => {
    try {
      console.log("MediasoupServer", "createConference", `${name}`);
      return this.signaling.createConference(name);
    } catch (error) {
      console.error("MediasoupServer", "createConference", `${name}`, error);
      return false;
    }
  };

  broadcast = () => {
    try {
      console.log("MediasoupServer", "broadcast");
      return this.signaling.producerBroadcast();
    } catch (error) {
      console.error("MediasoupServer", "broadcast", error);
      return false;
    }
  };

  consumingMedia = () => {
    try {
      console.log("MediasoupServer", "consumingMedia");
      return this.signaling.startConsumingMedia();
    } catch (error) {
      console.error("MediasoupServer", "consumingMedia", error);
      return false;
    }
  };

  joinConference = (conferenceId, routerId) => {
    try {
      console.log(
        "MediasoupClient",
        "joinConference",
        `conferenceId :${conferenceId}, routerId : ${routerId}`
      );
      return this.signaling.joinConference(conferenceId, routerId);
    } catch (error) {
      console.error(
        "MediasoupClient",
        "joinConference",
        `conferenceId :${conferenceId}, routerId : ${routerId}`,
        error
      );
      return false;
    }
    /* return new Promise(async (resolve, reject) => {
      try {
        console.log("MediasoupClient", "joinConference", `conferenceId :${conferenceId}, routerId : ${routerId}`);
        await this.signaling.joinConference(conferenceId,routerId,
          (track) => {
            resolve(track);
          }
        );
      } catch (error) {
        console.error("MediasoupClient", "joinConference", `conferenceId :${conferenceId}, routerId : ${routerId}`, error);
        reject(error);
      }
    }); */
  };
}

let mediasoupIndex = new index();
const mediasoup = {
  server: {
    broadcast: mediasoupIndex.broadcast,
    createConference: mediasoupIndex.createConference,
    initialize: mediasoupIndex.initialize,
    producingMedia: mediasoupIndex.producingMedia,
  },
  client: {
    joinConference: mediasoupIndex.joinConference,
    consumingMedia: mediasoupIndex.consumingMedia,
    initialize: mediasoupIndex.initialize,
  },
};
export default mediasoup;
