import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from './promisified-websocket';
const PING_LATENCY = 5000;
const PONG_LATENCY = 5000;
/**
    error
    (un)sub
    data
*/
function isRawUnSub(raw) {
    return raw.event === 'subscribe' || raw.event === 'unsubscribe';
}
function isRawError(raw) {
    return raw.event === 'error';
}
function isRawData(raw) {
    return !!raw.table;
}
class RawExtractor extends Startable {
    constructor(url) {
        super();
        this.url = url;
        this.socket = new PromisifiedWebSocket(this.url);
    }
    async _start() {
        this.socket.on('error', err => void this.emit('error', err));
        await this.socket.start(err => void this.stop(err));
        this.pinger = _.debounce(() => {
            this.socket.send('ping').catch(err => void this.stop(err));
            this.pongee = setTimeout(() => {
                this.stop(new Error('Pong not received')).catch(console.error);
            }, PONG_LATENCY);
            const onMessage = () => {
                this.socket.off('message', onMessage);
                clearTimeout(this.pongee);
                this.pongee = undefined;
            };
        }, PING_LATENCY);
        this.socket.on('message', (message) => {
            this.pinger();
            if (message instanceof Uint8Array) {
                const extracted = pako.inflateRaw(message, { to: 'string' });
                const rawMessage = JSON.parse(extracted);
                if (isRawError(rawMessage))
                    this.emit('error', new Error(rawMessage.message));
                else if (isRawUnSub(rawMessage))
                    this.emit('(un)sub', rawMessage);
                else if (isRawData(rawMessage))
                    this.emit('data', rawMessage);
            }
        });
    }
    async _stop(err) {
        if (this.pinger)
            this.pinger.cancel();
        if (this.pongee)
            clearTimeout(this.pongee);
        await this.socket.stop();
    }
    async send(object) {
        await this.socket.send(JSON.stringify(object));
    }
}
export { RawExtractor as default, RawExtractor, };
//# sourceMappingURL=raw-extractor.js.map