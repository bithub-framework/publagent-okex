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
    Operation,
} from './interfaces';
import config from './config';

/*
    events
        error
        subscribe/<rawChannel>
        unsubscribe/<rawChannel>
        trades/<rawInstrumentId>
        orderbook/<rawInstrumentId>
*/

function isRawUnSub(raw: RawMessage): raw is RawUnSub {
    return raw.event === 'subscribe' || raw.event === 'unsubscribe';
}
function isRawError(raw: RawMessage): raw is RawError {
    return raw.event === 'error';
}
function isRawData(raw: RawMessage): raw is RawData {
    return !!raw.table;
}

function isRawDataTrades(rawData: RawData): rawData is RawDataTrades {
    const c = rawData.table.split('/')[1];
    return c === 'trade';
}
function isRawDataOrderbook(rawData: RawData): rawData is RawDataOrderbook {
    const c = rawData.table.split('/')[1];
    return c === 'depth5';
}


class Deserializer extends Startable {
    private socket = new PromisifiedWebSocket(config.OKEX_WEBSOCKET_URL);
    private pinger?: _.DebouncedFunc<() => void>;
    private pongee?: NodeJS.Timeout;

    constructor() {
        super();
        this.socket.on('error', err => this.emit('error', err));
        this.socket.on('message', (message: Uint8Array) => {
            try {
                this.makePinger();
                const extracted = pako.inflateRaw(message, { to: 'string' });
                const rawMessage = <RawMessage | 'pong'>JSON.parse(extracted);
                if (rawMessage === 'pong') return;
                if (isRawError(rawMessage))
                    this.emit('error', new Error(rawMessage.message));
                else if (isRawUnSub(rawMessage))
                    this.onRawUnSub(rawMessage);
                else if (isRawData(rawMessage))
                    this.onRawData(rawMessage);
            } catch (err) {
                this.stop(err).catch(() => { });
            }
        });
    }

    private makePinger(): void {
        if (!this.pinger) this.pinger = _.debounce(() => {
            this.pinger = undefined;
            this.socket.send('ping')
                .catch(err => void this.stop(err).catch(() => { }));
            this.pongee = setTimeout(() => {
                this.stop(new Error('Pong not received'))
                    .catch(() => { });
            }, config.PONG_LATENCY);
            this.socket.once('message', () => {
                clearTimeout(this.pongee!);
                this.pongee = undefined;
            });
        }, config.PING_LATENCY);
        this.pinger();
    }

    protected async _start() {
        await this.socket.start(err => void this.stop(err).catch(() => { }));
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
            for (const [rawInstrumentId, rawTrades] of Object.entries(allRawTrades))
                this.emit(`trades/${rawInstrumentId}`, rawTrades);
        } else if (isRawDataOrderbook(rawData)) {
            for (const rawOrderbook of rawData.data)
                this.emit(`orderbook/${rawOrderbook.instrument_id}`, rawOrderbook);
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
