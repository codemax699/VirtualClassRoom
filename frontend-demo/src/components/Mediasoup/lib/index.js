import MediasoupSdk from "./MediasoupSdk";


class index extends MediasoupSdk {
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
        await this.signaling.producerBroadcast((status)=>{
            resolve(status);
        });
      } catch (error) {
        console.error("MediasoupServer", "broadcast",  error);
        reject(error);
      }
    });
  };

  joinConference = (conferenceId,routerId) => {
    return new Promise(async (resolve, reject) => {
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
    });
  };
}

let mediasoupIndex = new index();
const mediasoup = {
  server : { broadcast :mediasoupIndex.broadcast ,createConference :mediasoupIndex.createConference ,initialize:mediasoupIndex.initialize },
  client : { joinConference :mediasoupIndex.joinConference ,initialize:mediasoupIndex.initialize }
} 
export default mediasoup;

