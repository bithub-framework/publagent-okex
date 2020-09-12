import Startable from 'startable';
import pako from 'pako';
import _ from 'lodash';
import PromisifiedWebSocket from 'promisified-websocket';
import {
    RawMessage,
    RawError,
    RawUnSub,
    RawData,
} from './interfaces';
import config from './config';

const PING_LATENCY = 5000;
const PONG_LATENCY = 5000;

/*
    events:
        error
        (un)sub
        data
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

class RawExtractor extends Startable {
    private socket: PromisifiedWebSocket;
    private pinger?: _.DebouncedFunc<() => void>;
    private pongee?: NodeJS.Timeout;

    constructor() {
        super();
        this.socket = new PromisifiedWebSocket(config.OKEX_WEBSOCKET_URL);
    }

    protected async _start() {
        this.socket.on('error', err => void this.emit('error', err));
        await this.socket.start(err => void this.stop(err));

        this.pinger = _.debounce(() => {
            this.socket.send('ping').catch(err => void this.stop(err));
            this.pongee = setTimeout(() => {
                this.stop(new Error('Pong not received')).catch(console.error);
            }, PONG_LATENCY);
            this.socket.once('message', () => {
                clearTimeout(this.pongee!);
                this.pongee = undefined;
            });
        }, PING_LATENCY);

        this.socket.on('message', (message: 'pong' | Uint8Array) => {
            this.pinger!();
            if (message instanceof Uint8Array) {
                const extracted = pako.inflateRaw(message, { to: 'string' });
                const rawMessage = <RawMessage>JSON.parse(extracted);
                if (isRawError(rawMessage))
                    this.emit('error', new Error(rawMessage.message));
                else if (isRawUnSub(rawMessage))
                    this.emit('(un)sub', rawMessage);
                else if (isRawData(rawMessage))
                    this.emit('data', rawMessage);
            }
        });

        this.pinger();
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
    RawExtractor as default,
    RawExtractor,
}
