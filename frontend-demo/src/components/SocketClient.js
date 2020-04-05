import io from "socket.io-client";

export class SocketClient {
  constructor(authToken, path) {
    this._eventHandlers = {};

    this.socket = io(path, {
      forceNew: true,
      query: { authToken },
    });

    this.socket.on("open", (message) => {
      console.log(`SocketClient connection open`);
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("open", message);
        });
      }
    });

    this.socket.on("connect_error", (message) => {
      console.log(`SocketClient connection error`);
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("connect_error", message);
        });
      }
    });

    this.socket.on("connect_timeout", (message) => {
      console.log(`SocketClient connection timeout`);
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("connect_timeout", message);
        });
      }
    });

    this.socket.on("reconnect", (message) => {
      console.log(`SocketClient reconnected after ${message} attempts`);
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("reconnect", message);
        });
      }
    });

    this.socket.on("disconnect", (message) => {
      console.log(`SocketClient disconnected`);
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("disconnect", "disconnected");
        });
      }
    });

    this.socket.on("success", (message) => {
      if (this._eventHandlers) {
        Object.keys(this._eventHandlers).forEach((key) => {
          this._eventHandlers[key]("success", message);
        });
      }
      console.log("SocketClient initiation succsessfull");
    });
  }

  subscribeEventHandler(name, handler) {
    this._eventHandlers[name] = handler;
  }

  disconnect() {
    try {
      this.socket.disconnect(true);
    } catch (ex) {
      console.error("disconnecting Connection", ex);
    }
  }

  request = (command,data) => {
    return new Promise(function (resolve, reject) {
      try {
        this.socket.emit(command, { data }, (ackData) => {
          resolve(ackData);
        });
      } catch (error) {
        console.error("SocketClient", "request", error);
        reject(error);
      }
    });
  };
}
