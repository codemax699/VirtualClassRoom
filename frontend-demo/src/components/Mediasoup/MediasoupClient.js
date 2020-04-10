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

  joinConference = (conferenceId,routerId) => {
    
    return new Promise(async (resolve, reject) => {
      try {
        console.log("MediasoupClient", "joinConference", `conferenceId :${conferenceId}, routerId : ${routerId}`);
        await super.signaling.joinConference(conferenceId,routerId,
          (track) => {
            resolve(track);
          }
        );
        
      } catch (error) {
        console.error("MediasoupClient", "joinConference", `conferenceId :${conferenceId}, routerId : ${routerId}`, error);
        reject(error);
      }
    });
  };

  consumingMedia = async (conferenceId,routerId) => {    
    return await super.signaling.consumingMedia(conferenceId,routerId);
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
const client = {broadcast:mediasoupClient.broadcast ,joinConference :mediasoupClient.joinConference,consumingMedia:mediasoupClient.consumingMedia ,initialize:mediasoupClient.initialize };
export default client;

