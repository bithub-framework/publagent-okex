import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from 'promisified-websocket';
import config from './config';
/*
    events
        error
        subscribe/<rawChannel>
        unsubscribe/<rawChannel>
        trades/<rawInstrumentId>
        orderbook/<rawInstrumentId>
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
function isRawDataTrades(rawData) {
    const c = rawData.table.split('/')[1];
    return c === 'trades';
}
function isRawDataOrderbook(rawData) {
    const c = rawData.table.split('/')[1];
    return c === 'depth5';
}
class Deserializer extends Startable {
    constructor() {
        super();
        this.socket = new PromisifiedWebSocket(config.OKEX_WEBSOCKET_URL);
        this.socket.on('error', err => this.emit('error', err));
        this.socket.on('message', (message) => {
            try {
                this.makePinger();
                const extracted = pako.inflateRaw(message, { to: 'string' });
                const rawMessage = JSON.parse(extracted);
                if (rawMessage === 'pong')
                    return;
                if (isRawError(rawMessage))
                    this.emit('error', new Error(rawMessage.message));
                else if (isRawUnSub(rawMessage))
                    this.onRawUnSub(rawMessage);
                else if (isRawData(rawMessage))
                    this.onRawData(rawMessage);
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
        });
    }
    makePinger() {
        if (!this.pinger)
            this.pinger = _.debounce(() => {
                this.pinger = undefined;
                this.socket.send('ping')
                    .catch(err => void this.stop(err).catch(() => { }));
                this.pongee = setTimeout(() => {
                    this.stop(new Error('Pong not received'))
                        .catch(() => { });
                }, config.PONG_LATENCY);
                this.socket.once('message', () => {
                    clearTimeout(this.pongee);
                    this.pongee = undefined;
                });
            }, config.PING_LATENCY);
        this.pinger();
    }
    async _start() {
        await this.socket.start(err => void this.stop(err).catch(() => { }));
        this.makePinger();
    }
    onRawData(rawData) {
        if (isRawDataTrades(rawData)) {
            const allRawTrades = {};
            for (const rawTrade of rawData.data) {
                if (!allRawTrades[rawTrade.instrument_id])
                    allRawTrades[rawTrade.instrument_id] = [];
                allRawTrades[rawTrade.instrument_id].push(rawTrade);
            }
            for (const [rawInstrumentId, rawTrades] of Object.entries(allRawTrades))
                this.emit(`trades/${rawInstrumentId}`, rawTrades);
        }
        else if (isRawDataOrderbook(rawData)) {
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
export { Deserializer as default, Deserializer, };
//# sourceMappingURL=deserializer.js.map