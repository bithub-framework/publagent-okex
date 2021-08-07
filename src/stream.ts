import { Startable } from 'startable';
import WebSocket = require('ws');
import { once } from 'events';
import {
    OKEX_WEBSOCKET_URL,
    PING_INTERVAL,
} from './config';


// 不可复用
export class Stream extends Startable {
    private socket?: WebSocket;
    private pingTimer?: NodeJS.Timeout;

    protected async _start() {
        this.socket = new WebSocket(OKEX_WEBSOCKET_URL);
        this.socket.on('error', err => this.emit('error', err));
        this.socket.on('close', (code, reason) => void this.starp(new Error(reason)));

        this.socket.on('message', (message: string) => {
            try {
                if (message === 'pong') return;
                this.emit('message', JSON.parse(message));
            } catch (err) {
                this.stop(err).catch(() => { });
            }
        });
        await once(this.socket, 'open');

        this.pingTimer = setInterval(() => {
            this.socket!.send('ping', err => err && this.starp(err));
        }, PING_INTERVAL);
    }

    protected async _stop() {
        if (this.pingTimer) clearInterval(this.pingTimer);
        if (this.socket) {
            this.socket.close();
            await once(this.socket, 'close');
        }
    }

    public async send(object: {}): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.socket!.send(
                JSON.stringify(object),
                err => err ? reject(err) : resolve(),
            );
        });
    }
}
