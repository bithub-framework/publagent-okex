import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from 'promisified-websocket';
import config from './config';
const PING_LATENCY = 5000;
const PONG_LATENCY = 5000;
/*
    events
        error
        subscribe/<rawChannel>
        unsubscribe/<rawChannel>
        trades/<instrumentId>
        orderbook/<instrumentId>
*/
function isRawUnSub(raw) {
    return raw.event === "subscribe" /* subscribe */ || raw.event === "unsubscribe" /* unsubscribe */;
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
        return "trades" /* TRADES */;
    if (c === 'depth5')
        return "orderbook" /* ORDERBOOK */;
    throw new Error('unknown channel');
}
function isRawDataTrades(rawData) {
    return getChannel(rawData) === "trades" /* TRADES */;
}
function isRawDataOrderbook(rawData) {
    return getChannel(rawData) === "orderbook" /* ORDERBOOK */;
}
class Deserializer extends Startable {
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
            try {
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
            }
            catch (err) {
                this.stop(err);
            }
        });
        this.pinger();
    }
    onRawData(rawData) {
        if (isRawDataTrades(rawData)) {
            const allRawTrades = {};
            for (const rawTrade of rawData.data) {
                if (!allRawTrades[rawTrade.instrument_id])
                    allRawTrades[rawTrade.instrument_id] = [];
                allRawTrades[rawTrade.instrument_id].push(rawTrade);
            }
            for (const [instrumentId, rawTrades] of Object.entries(allRawTrades))
                this.emit(`${"trades" /* TRADES */}/${instrumentId}`, rawTrades);
        }
        if (isRawDataOrderbook(rawData)) {
            for (const rawOrderbook of rawData.data)
                this.emit(`${"orderbook" /* ORDERBOOK */}/${rawOrderbook.instrument_id}`, rawOrderbook);
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
export { Deserializer as default, Deserializer, };
//# sourceMappingURL=deserializer.js.map