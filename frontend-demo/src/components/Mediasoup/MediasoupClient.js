import MediasoupSdk from "./lib/MediasoupSdk";

class MediasoupClient extends MediasoupSdk {
  
  constructor() {
    // call the MediasoupSdk constructor
    super();
  }
  
  initialize = (callBackEvents) => {
    try {
      console.log("MediasoupServer", "createConference");
    return  this.initializeSDK(callBackEvents);

    } catch (error) {
      console.error("MediasoupServer", "createConference",  error);
      return false;
    }
  }; 

  joinConference = (name) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("MediasoupClient", "joinConference", `${name}`);
        await super.signaling.getRouterCapabilities(
          (track) => {
            resolve(track);
          }
        );
      } catch (error) {
        console.error("MediasoupClient", "joinConference", `${name}`, error);
        reject(error);
      }
    });
  };

  broadcast = () => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("MediasoupClient", "broadcast");
        await super.signaling.producerBroadcast((status) => {
          resolve(status);
        });
      } catch (error) {
        console.error("MediasoupClient", "broadcast", error);
        reject(error);
      }
    });
  };
}

let mediasoupClient = new MediasoupClient();
const client = {broadcast:mediasoupClient.broadcast ,joinConference :mediasoupClient.joinConference ,initialize:mediasoupClient.initialize };
export default client;

