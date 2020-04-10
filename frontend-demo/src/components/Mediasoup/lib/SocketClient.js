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
          case "media-broadcast": {
            break;
          }
          case "activeSpeaker": {
            break;
          }
          case "consumerClosed": {
            break;
          }
          case "consumerPaused": {
            break;
          }
          case "consumerResumed": {
            break;
          }
          case "consumerScore": {
            break;
          }
          case "producerScore": {
            break;
          }
          case "layerChanged": {
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
