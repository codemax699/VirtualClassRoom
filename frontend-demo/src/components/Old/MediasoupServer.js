import MediasoupSdk from "../Mediasoup/lib/MediasoupSdk";
import mediasoup from "../Mediasoup/lib";

class MediasoupServer extends MediasoupSdk {
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

  producerHandle = () => {
   return super.producerHandle();
  };

  consumerHandle = () => {
    return super.consumerHandle();
  };
  transportHandle = () => {
   return  super.transportHandle();
  };
}

let mediasoupServer = new MediasoupServer();
const server = {
  transportHandle: mediasoupServer.transportHandle,
  consumerHandle: mediasoupServer.consumerHandle,
  producerHandle: mediasoupServer.producerHandle,
  initialize: mediasoupServer.initialize,
};

export default server;
