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

  

  producerHandle = () => {
   return this.producerHandle();
  };

  consumerHandle = () => {
   return this.consumerHandle();
  };
  
  transportHandle = () => {
   return this.transportHandle();
  };
}

let mediasoupIndex = new index();
const mediasoup = {
  server: {
    initialize: mediasoupIndex.initialize,
    producingMedia: mediasoupIndex.producingMedia,
    transportHandle: mediasoupIndex.transportHandle,
    consumerHandle: mediasoupIndex.consumerHandle,
    producerHandle: mediasoupIndex.producerHandle,
  },
  client: {
    initialize: mediasoupIndex.initialize,
    transportHandle: mediasoupIndex.transportHandle,
    consumerHandle: mediasoupIndex.consumerHandle,
  },
};
export default mediasoup;
