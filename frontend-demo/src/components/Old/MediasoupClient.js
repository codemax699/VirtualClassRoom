import MediasoupSdk from "../Mediasoup/lib/MediasoupSdk";

class MediasoupClient extends MediasoupSdk {
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

  consumerHandle = () => {
    return super.consumerHandle();
  };
  transportHandle = () => {
    return super.transportHandle();
  };
}

let mediasoupClient = new MediasoupClient();
const client = {
  transportHandle: mediasoupClient.transportHandle,
  consumerHandle: mediasoupClient.consumerHandle,
  initialize: mediasoupClient.initialize,
};
export default client;
