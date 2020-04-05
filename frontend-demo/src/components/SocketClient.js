import io from "socket.io-client";
let webSocket;
export class SocketClient {
  constructor(onMessage, path) {
    webSocket = new WebSocket(path);
    this.socket = webSocket;
    webSocket.onopen = function (e) {
      console.log("SocketClient", "onopen", `Socket Connected With ${path}`);
    };

    webSocket.onmessage = function (event) {
      onMessage(event.data);
      //alert(`[message] Data received from server: ${event.data}`);
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
