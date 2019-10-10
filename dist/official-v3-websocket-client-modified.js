"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const pako_1 = __importDefault(require("pako"));
const crypto_1 = __importDefault(require("crypto"));
const crc_32_1 = __importDefault(require("crc-32"));
class V3WebsocketClient extends events_1.EventEmitter {
    constructor(websocketURI = 'wss://real.okex.com:10442/ws/v3') {
        super();
        this.websocketUri = websocketURI;
    }
    connect() {
        if (this.socket) {
            this.socket.close();
        }
        this.socket = new ws_1.default(this.websocketUri);
        this.socket.on('open', () => this.onOpen());
        this.socket.on('close', (code, reason) => this.onClose(code, reason));
        this.socket.on('message', data => this.onMessage(data));
        this.socket.on('error', err => this.emit('error', err));
    }
    login(apiKey, apiSecret, passphrase) {
        const timestamp = Date.now() / 1000;
        const str = timestamp + 'GET/users/self/verify';
        const hmac = crypto_1.default.createHmac('sha256', apiSecret);
        const request = JSON.stringify({
            op: 'login',
            args: [
                apiKey,
                passphrase,
                timestamp.toString(),
                hmac.update(str).digest('base64')
            ]
        });
        this.socket.send(request);
    }
    subscribe(...args) {
        this.send({ op: 'subscribe', args });
    }
    unsubscribe(...args) {
        this.send({ op: 'unsubscribe', args });
    }
    static checksum(data) {
        if (data == null || data == undefined) {
            return false;
        }
        let result = data;
        if (typeof data === 'string') {
            result = JSON.parse(data);
        }
        if (result.data && result.data.length > 0) {
            const item = result.data[0];
            const buff = [];
            for (let i = 0; i < 25; i++) {
                if (item.bids[i]) {
                    const bid = item.bids[i];
                    buff.push(bid[0]);
                    buff.push(bid[1]);
                }
                if (item.asks[i]) {
                    const ask = item.asks[i];
                    buff.push(ask[0]);
                    buff.push(ask[1]);
                }
            }
            const checksum = crc_32_1.default.str(buff.join(':'));
            if (checksum === item.checksum) {
                return true;
            }
        }
        return false;
    }
    send(messageObject) {
        if (!this.socket)
            throw Error('socket is not open');
        this.socket.send(JSON.stringify(messageObject));
    }
    onOpen() {
        this.initTimer();
        this.emit('open');
    }
    initTimer() {
        this.interval = setInterval(() => {
            if (this.socket) {
                this.socket.send('ping');
            }
        }, 5000);
    }
    resetTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.initTimer();
        }
    }
    onMessage(data) {
        this.resetTimer();
        if (!(typeof data === 'string')) {
            data = pako_1.default.inflateRaw(data, { to: 'string' });
        }
        if (data === 'pong') {
            return;
        }
        this.emit('message', data);
    }
    onClose(code, reason) {
        this.socket = undefined;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.emit('close');
    }
    close() {
        if (this.socket) {
            this.socket.close();
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            this.socket = undefined;
        }
    }
}
exports.V3WebsocketClient = V3WebsocketClient;
exports.default = V3WebsocketClient;
//# sourceMappingURL=official-v3-websocket-client-modified.js.map