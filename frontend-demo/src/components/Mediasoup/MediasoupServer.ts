import MediasoupSdk from "./lib/MediasoupSdk";

class MediasoupServer extends MediasoupSdk {
  constructor(path) {
    // call the MediasoupSdk constructor
    super(path);
  }

  createConference = (name) => {
    return new Promise(async (resolve, reject)=> {
      try {
        console.log("MediasoupServer", "createConference", `${name}`);
        await super.signaling.createConference(name,(track:MediaStreamTrack)=>{
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
        await super.signaling.producerBroadcast((status:boolean)=>{
            resolve(status);
        });
      } catch (error) {
        console.error("MediasoupServer", "broadcast", `${name}`, error);
        reject(error);
      }
    });
  };
}
