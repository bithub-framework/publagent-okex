"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
const startable_1 = require("startable");
const WebSocket = require("ws");
const events_1 = require("events");
const config_1 = require("./config");
// 不可复用
class Stream extends startable_1.Startable {
    async _start() {
        this.socket = new WebSocket(config_1.OKEX_WEBSOCKET_URL);
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
            this.socket.send('ping', err => err && this.starp(err));
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
        await new Promise((resolve, reject) => {
            this.socket.send(JSON.stringify(object), err => err ? reject(err) : resolve());
        });
    }
}
exports.Stream = Stream;
//# sourceMappingURL=stream.js.map