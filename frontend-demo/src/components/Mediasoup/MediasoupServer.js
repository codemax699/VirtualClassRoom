import MediasoupSdk from "./lib/MediasoupSdk";

class MediasoupServer extends MediasoupSdk {
  
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
 
  createConference = (name) => {
    return new Promise(async (resolve, reject)=> {
      try {
        console.log("MediasoupServer", "createConference", `${name}`);
        await this.signaling.createConference(name,(track)=>{
            resolve(track);
        });
      } catch (error) {
        console.error("MediasoupServer", "createConference", `${name}`, error);
        reject(error);
      }
    });
  };  
 
  broadcast = () => {
    return new Promise(async (resolve, reject)=> {
      try {
        console.log("MediasoupServer", "broadcast");
        await super.signaling.producerBroadcast((status)=>{
            resolve(status);
        });
      } catch (error) {
        console.error("MediasoupServer", "broadcast",  error);
        reject(error);
      }
    });
  };
}

let mediasoupServer = new MediasoupServer();
const server = { broadcast :mediasoupServer.broadcast ,createConference :mediasoupServer.createConference ,initialize:mediasoupServer.initialize }

export default server;
