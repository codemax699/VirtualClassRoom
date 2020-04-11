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

  producer = this.producerHandle;

  consumer = this.consumerHandle;

  transport = this.transportHandle;
}

let mediasoupIndex = new index();
class PhoneHandle {
  server = {
    initialize: mediasoupIndex.initialize,
    transportHandle: mediasoupIndex.transport,
    consumerHandle: mediasoupIndex.consumer,
    producerHandle: mediasoupIndex.producer,
  };
  client = {
    initialize: mediasoupIndex.initialize,
    transportHandle: mediasoupIndex.transport,
    consumerHandle: mediasoupIndex.consumer,
  };
}
export default PhoneHandle;
