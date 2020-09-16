import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from 'promisified-websocket';
import config from './config';
const PING_LATENCY = 5000;
const PONG_LATENCY = 5000;
/*
    events:
        error
        subscribe/<rawChannel>
        unsubscribe/<rawChannel>
        trades/<instrumentId>
        orderbook/<instrumentId>
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
function getChannel(rawData) {
    const c = rawData.table.split('/')[1];
    if (c === 'trade')
        return 'trades';
    if (c === 'depth5')
        return 'orderbook';
    throw new Error('invalid channel');
}
function isRawTrades(rawData) {
    return getChannel(rawData) === 'trades';
}
function isRawOrderbook(rawData) {
    return getChannel(rawData) === 'orderbook';
}
class RawExtractor extends Startable {
    constructor() {
        super();
        this.socket = new PromisifiedWebSocket(config.OKEX_WEBSOCKET_URL);
    }
    async _start() {
        this.socket.on('error', err => void this.emit('error', err));
        await this.socket.start(err => void this.stop(err));
        this.pinger = _.debounce(() => {
            this.socket.send('ping').catch(err => void this.stop(err));
            this.pongee = setTimeout(() => {
                this.stop(new Error('Pong not received')).catch(console.error);
            }, PONG_LATENCY);
            this.socket.once('message', () => {
                clearTimeout(this.pongee);
                this.pongee = undefined;
            });
        }, PING_LATENCY);
        this.socket.on('message', (message) => {
            this.pinger();
            if (message instanceof Uint8Array) {
                const extracted = pako.inflateRaw(message, { to: 'string' });
                const rawMessage = JSON.parse(extracted);
                if (isRawError(rawMessage))
                    this.emit('error', new Error(rawMessage.message));
                else if (isRawUnSub(rawMessage))
                    this.onRawUnSub(rawMessage);
                else if (isRawData(rawMessage))
                    this.onRawData(rawMessage);
            }
        });
        this.pinger();
    }
    onRawData(rawData) {
        if (isRawTrades(rawData)) {
            const allRawTrades = {};
            for (const rawTrade of rawData.data) {
                if (allRawTrades[rawTrade.instrument_id] === undefined)
                    allRawTrades[rawTrade.instrument_id] = [];
                allRawTrades[rawTrade.instrument_id].push(rawTrade);
            }
            for (const [instrumentId, rawTrades] of Object.entries(allRawTrades))
                this.emit(`trades/${instrumentId}`, rawTrades);
        }
        if (isRawOrderbook(rawData)) {
            for (const rawOrderbook of rawData.data)
                this.emit(`orderbook/${rawOrderbook.instrument_id}`, rawOrderbook);
        }
        else
            throw new Error('unknown channel');
    }
    onRawUnSub(rawUnSub) {
        this.emit(`${rawUnSub.event}/${rawUnSub.channel}`, rawUnSub);
    }
    async _stop() {
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