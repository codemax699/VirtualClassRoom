import MediasoupSdk from "./lib/MediasoupSdk";

class index extends MediasoupSdk {
  subscribeEvents = {};
  constructor() {
    // call the MediasoupSdk constructor
    super();
  }

  
  events = {
    onBroadcastSuccess: (val) => {
      try {
        if (this.subscribeEvents["onBroadcastSuccess"]) {
          Object.keys(this.subscribeEvents["onBroadcastSuccess"]).forEach(key => {
            this.subscribeEvents["onBroadcastSuccess"][key](val);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "onBroadcastSuccess", error);
        throw error;
      }
    },
    onJoinConferenceSuccess: (msg) => {
      try {
        if (this.subscribeEvents["onJoinConferenceSuccess"]) {
          Object.keys(this.subscribeEvents["onJoinConferenceSuccess"]).forEach(key => {
            this.subscribeEvents["onJoinConferenceSuccess"][key](msg);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "onJoinConferenceSuccess", error);
        throw error;
      }
    },
    onConferenceSuccess: (msg) => {
      try {
        if (this.subscribeEvents["onConferenceSuccess"]) {
          Object.keys(this.subscribeEvents["onConferenceSuccess"]).forEach(key => {
            this.subscribeEvents["onConferenceSuccess"][key](msg);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "onConferenceSuccess", error);
        throw error;
      }
    },
    onMyStream: (kind, mStream) => {
      try {
        if (this.subscribeEvents["onMyStream"]) {
          Object.keys(this.subscribeEvents["onMyStream"]).forEach(key => {
            this.subscribeEvents["onMyStream"][key](kind, mStream);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "onMyStream", error);
        throw error;
      }
    },
    newConsumer: (id, consumer) => {
      try {
        if (this.subscribeEvents["newConsumer"]) {
          Object.keys(this.subscribeEvents["newConsumer"]).forEach(key => {
            this.subscribeEvents["newConsumer"][key](id, consumer);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
        throw error;
      }
    },
    onConsumerMediaAdded: (medias) => {
      try {
        if (this.subscribeEvents["onConsumerMediaAdded"]) {
          Object.keys(this.subscribeEvents["onConsumerMediaAdded"]).forEach(key => {
            this.subscribeEvents["onConsumerMediaAdded"][key](medias);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
        throw error;
      }
    },
    onConsumerScreenAdded: (screens) => {
      try {
        if (this.subscribeEvents["onConsumerScreenAdded"]) {
          Object.keys(this.subscribeEvents["onConsumerScreenAdded"]).forEach(key => {
            this.subscribeEvents["onConsumerScreenAdded"][key](screens);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
        throw error;
      }
    },
    closeConsumer: (id) => {
      try {
        if (this.subscribeEvents["closeConsumer"]) {
          Object.keys(this.subscribeEvents["closeConsumer"]).forEach(key => {
            this.subscribeEvents["closeConsumer"][key](id);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "newConsumer", error);
        throw error;
      }
    },
    newPeer: (notification) => {
      try {
        if (this.subscribeEvents["newPeer"]) {
          Object.keys(this.subscribeEvents["newPeer"]).forEach(key => {
            this.subscribeEvents["newPeer"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "newPeer", error);
        throw error;
      }
    },
    peerClosed: (notification) => {
      try {
        if (this.subscribeEvents["peerClosed"]) {
          Object.keys(this.subscribeEvents["peerClosed"]).forEach(key => {
            this.subscribeEvents["peerClosed"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "peerClosed", error);
        throw error;
      }
    },
    consumerClosed: (notification) => {
      try {
        if (this.subscribeEvents["consumerClosed"]) {
          Object.keys(this.subscribeEvents["consumerClosed"]).forEach(key => {
            this.subscribeEvents["consumerClosed"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "consumerClosed", error);
        throw error;
      }
    },
    consumerPaused: (notification) => {
      try {
        if (this.subscribeEvents["consumerPaused"]) {
          Object.keys(this.subscribeEvents["consumerPaused"]).forEach(key => {
            this.subscribeEvents["consumerPaused"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "consumerPaused", error);
        throw error;
      }
    },
    consumerResumed: (notification) => {
      try {
        if (this.subscribeEvents["consumerResumed"]) {
          Object.keys(this.subscribeEvents["consumerResumed"]).forEach(key => {
            this.subscribeEvents["consumerResumed"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "consumerResumed", error);
        throw error;
      }
    },
    consumerLayersChanged: (notification) => {
      try {
        if (this.subscribeEvents["consumerLayersChanged"]) {
          Object.keys(this.subscribeEvents["consumerLayersChanged"]).forEach(key => {
            this.subscribeEvents["consumerLayersChanged"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "consumerLayersChanged", error);
        throw error;
      }
    },
    activeSpeaker: (notification) => {
      try {
        if (this.subscribeEvents["activeSpeaker"]) {
          Object.keys(this.subscribeEvents["activeSpeaker"]).forEach(key => {
            this.subscribeEvents["activeSpeaker"][key](notification);
          });
        }
      } catch (error) {
        console.error("SoftPhone", "events", "activeSpeaker", error);
        throw error;
      }
    },
  };

  subscribeEvent = (subscriber, event, handler) => {
    if (!this.subscribeEvents[event]) {
      this.subscribeEvents[event] = {};
    }
    this.subscribeEvents[event][subscriber] = handler;
  };

  initialize = () => {
    try {
      console.log("MediasoupServer", "initialize Signaling SDK");
      /* if(Object.keys(this.subscribeEvents).length){
        throw new Error('no subscribe event listener')
      } */
      return this.initializeSDK(this.events);
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
    subscribeEvent: mediasoupIndex.subscribeEvent,
  };
  client = {
    initialize: mediasoupIndex.initialize,
    transportHandle: mediasoupIndex.transport,
    consumerHandle: mediasoupIndex.consumer,
    subscribeEvent: mediasoupIndex.subscribeEvent,
  };
}
export default PhoneHandle;
