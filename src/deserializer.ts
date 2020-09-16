import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from 'promisified-websocket';
import {
    RawMessage,
    RawError,
    RawUnSub,
    RawData,
    RawTrade,
    RawDataTrades,
    RawDataOrderbook,
    Channel,
    Operation,
} from './interfaces';
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

function isRawUnSub(raw: RawMessage): raw is RawUnSub {
    return raw.event === Operation.subscribe || raw.event === Operation.unsubscribe;
}
function isRawError(raw: RawMessage): raw is RawError {
    return raw.event === 'error';
}
function isRawData(raw: RawMessage): raw is RawData {
    return !!raw.table;
}

function getChannel(rawData: RawData): Channel {
    const c = rawData.table.split('/')[1];
    if (c === 'trade') return Channel.TRADES;
    if (c === 'depth5') return Channel.ORDERBOOK;
    throw new Error('unknown channel');
}

function isRawDataTrades(rawData: RawData): rawData is RawDataTrades {
    return getChannel(rawData) === Channel.TRADES;
}
function isRawDataOrderbook(rawData: RawData): rawData is RawDataOrderbook {
    return getChannel(rawData) === Channel.ORDERBOOK;
}

class Deserializer extends Startable {
    private socket = new PromisifiedWebSocket(config.OKEX_WEBSOCKET_URL);
    private pinger?: _.DebouncedFunc<() => void>;
    private pongee?: NodeJS.Timeout;

    private makePinger(): void {
        if (!this.pinger) this.pinger = _.debounce(() => {
            this.pinger = undefined;
            this.socket.send('ping').catch(err => this.stop(err));
            this.pongee = setTimeout(() => {
                this.stop(new Error('Pong not received')).catch(console.error);
            }, PONG_LATENCY);
            this.socket.once('message', () => {
                clearTimeout(this.pongee!);
                this.pongee = undefined;
            });
        }, PING_LATENCY);
        this.pinger();
    }

    protected async _start() {
        this.socket.on('error', err => this.emit('error', err));
        await this.socket.start(err => this.stop(err));

        this.socket.on('message', (message: 'pong' | Uint8Array) => {
            try {
                this.makePinger();
                if (message instanceof Uint8Array) {
                    const extracted = pako.inflateRaw(message, { to: 'string' });
                    const rawMessage = <RawMessage>JSON.parse(extracted);
                    if (isRawError(rawMessage))
                        this.emit('error', new Error(rawMessage.message));
                    else if (isRawUnSub(rawMessage))
                        this.onRawUnSub(rawMessage);
                    else if (isRawData(rawMessage))
                        this.onRawData(rawMessage);
                }
            } catch (err) {
                this.stop(err);
            }
        });

        this.makePinger();
    }

    private onRawData(rawData: RawData): void {
        if (isRawDataTrades(rawData)) {
            const allRawTrades: {
                [instrument_id: string]: RawTrade[];
            } = {};
            for (const rawTrade of rawData.data) {
                if (!allRawTrades[rawTrade.instrument_id])
                    allRawTrades[rawTrade.instrument_id] = [];
                allRawTrades[rawTrade.instrument_id].push(rawTrade);
            }
            for (const [instrumentId, rawTrades] of Object.entries(allRawTrades))
                this.emit(`${Channel.TRADES}/${instrumentId}`, rawTrades);
        } if (isRawDataOrderbook(rawData)) {
            for (const rawOrderbook of rawData.data)
                this.emit(`${Channel.ORDERBOOK}/${rawOrderbook.instrument_id}`, rawOrderbook);
        } else throw new Error('unknown channel');
    }

    private onRawUnSub(rawUnSub: RawUnSub): void {
        this.emit(`${<Operation>rawUnSub.event}/${rawUnSub.channel}`, rawUnSub);
    }

    protected async _stop() {
        if (this.pinger) this.pinger.cancel();
        if (this.pongee) clearTimeout(this.pongee);
        await this.socket.stop();
    }

    public async send(object: object): Promise<void> {
        await this.socket.send(JSON.stringify(object));
    }
}

export {
    Deserializer as default,
    Deserializer,
}
