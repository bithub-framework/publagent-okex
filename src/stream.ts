import { Startable } from 'startable';
import WebSocket = require('ws');
import { once } from 'events';
import { IncomingMessage } from 'http';
import Bluebird = require('bluebird');
import {
    OKEX_WEBSOCKET_URL,
    PING_INTERVAL,
} from './config';


export class Stream extends Startable {
    private socket?: WebSocket;
    private pingTimer?: NodeJS.Timeout;

    protected async _start() {
        this.socket = Bluebird.promisifyAll(new WebSocket(OKEX_WEBSOCKET_URL));
        const [res] = <[IncomingMessage]>await once(this.socket, 'upgrade');
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
            // @ts-ignore
            this.socket!.sendAsync('ping').catch(this.starp);
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
        // @ts-ignore
        await this.socket!.sendAsync(JSON.stringify(object));
    }
}
