import MediasoupSdk from "./MediasoupSdk";

class index extends MediasoupSdk {
 
  constructor() {
    // call the MediasoupSdk constructor
    super();
  }

  initialize = (callBackEvents) => {
    try {
      console.log("MediasoupServer", "initialize Signaling SDK");
      return this.initializeSDK(callBackEvents);
    } catch (error) {
      console.error("MediasoupServer", "initialize Signaling SDK", error);
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
