import { socketClient } from "../../../config/mediasoupConfig";

let webSocket;
let messageListener;
export class SocketClient {
  constructor(listener) {
    webSocket = new WebSocket(socketClient.path);
    messageListener = listener;
    webSocket.onopen = function (e) {
      console.log(
        "SocketClient",
        "onopen",
        `Socket Connected With ${socketClient.path}`
      );
    };

    webSocket.onclose = function (event) {
      if (event.wasClean) {
        console.error(
          "SocketClient",
          "onclose",
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.error(
          "SocketClient",
          "onclose",
          "[close] Connection died",
          event
        );
      }
    };

    webSocket.onerror = function (error) {
      console.error("SocketClient", "onerror", error);
    };

    webSocket.onmessage = (event) => {
      try {
        console.log("SocketClient", "messageProcessor", `${event.data}`);
        const msg = JSON.parse(event.data);
        switch (msg.event) {
          case "conference-create": {
            if (messageListener && messageListener.onConferenceCreate)
              messageListener.onConferenceCreate(msg);
            break;
          }
          case "router-capability": {
            if (messageListener && messageListener.onRouterCapability)
              messageListener.onRouterCapability(msg);
            break;
          }
          case "transport-create": {
            if (messageListener && messageListener.onTransportCreate)
              messageListener.onTransportCreate(msg);
            break;
          }
          case "transport-connect": {
            break;
          }
          case "producer-create": {
            if (messageListener && messageListener.onProducerCreate)
              messageListener.onProducerCreate(msg);
            break;
          }
          case "consumer-create": {
            if (messageListener && messageListener.onConsumerCreate)
              messageListener.onConsumerCreate(msg);
            break;
          }
          case "consumer-added": {
            if (messageListener && messageListener.onConsumerAdded)
              messageListener.onConsumerAdded(msg);
            break;
          }
          case "media-broadcast": {
            if (messageListener && messageListener.mediaBroadcast)
              messageListener.mediaBroadcast(msg);
            break;
          }
          case "activeSpeaker": {
            if (messageListener && messageListener.activeSpeaker)
              messageListener.activeSpeaker(msg);
            break;
          }
          case "consumerClosed": {
            if (messageListener && messageListener.consumerClosed)
              messageListener.consumerClosed(msg);
            break;
          }
          case "consumerPaused": {
            if (messageListener && messageListener.consumerPaused)
              messageListener.consumerPaused(msg);
            break;
          }
          case "consumerResumed": {
            if (messageListener && messageListener.consumerResumed)
              messageListener.consumerResumed(msg);
            break;
          }
          case "consumerScore": {
            if (messageListener && messageListener.consumerScore)
              messageListener.consumerScore(msg);
            break;
          }
          case "producerScore": {
            if (messageListener && messageListener.producerScore)
              messageListener.producerScore(msg);
            break;
          }
          case "layerChanged": {
            if (messageListener && messageListener.layerChanged)
              messageListener.layerChanged(msg);
            break;
          }
          default: {
            break;
          }
        }
      } catch (error) {
        console.error("MediasoupHandler", "messageProcessor", error);
      }
    };
  }

  subscribeEventHandler(name, handler) {
    this._eventHandlers[name] = handler;
  }

  disconnect() {
    try {
      console.log("SocketClient", "disconnect", `Socket disconnected `);
      webSocket.disconnect(true);
    } catch (ex) {
      console.error("disconnecting Connection", ex);
    }
  }

  request = (command, data) => {
    return new Promise(
      function (resolve, reject) {
        try {
          const msg = JSON.stringify({ action: command, message: data });
          console.log("SocketClient", "send", `Send Message : ${msg}`);
          webSocket.send(msg);
          resolve(true);
        } catch (error) {
          console.error("SocketClient", "request", error);
          reject(error);
        }
      }.bind(this)
    );
  };
}
