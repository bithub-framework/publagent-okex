"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
const startable_1 = require("startable");
const WebSocket = require("ws");
const events_1 = require("events");
const Bluebird = require("bluebird");
const config_1 = require("./config");
class Stream extends startable_1.Startable {
    async _start() {
        this.socket = Bluebird.promisifyAll(new WebSocket(config_1.OKEX_WEBSOCKET_URL));
        this.socket.on('error', err => this.emit('error', err));
        this.socket.on('close', (code, reason) => void this.starp(new Error(reason)));
        this.socket.on('message', (message) => {
            try {
                if (message === 'pong')
                    return;
                this.emit('message', JSON.parse(message));
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
        });
        await events_1.once(this.socket, 'open');
        this.pingTimer = setInterval(() => {
            // @ts-ignore
            this.socket.sendAsync('ping').catch(this.starp);
        }, config_1.PING_INTERVAL);
    }
    async _stop() {
        if (this.pingTimer)
            clearInterval(this.pingTimer);
        if (this.socket) {
            this.socket.close();
            await events_1.once(this.socket, 'close');
        }
    }
    async send(object) {
        // @ts-ignore
        await this.socket.sendAsync(JSON.stringify(object));
    }
}
exports.Stream = Stream;
//# sourceMappingURL=stream.js.map