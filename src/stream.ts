import { Startable } from 'startable';
import _ = require('lodash');
import { Websocket } from './websocket';
import { once } from 'events';
import { IncomingMessage } from 'http';
import Bluebird = require('bluebird');
import { setUserTimeout } from 'net-keepalive';
import {
    OKEX_WEBSOCKET_URL,
    PING_INTERVAL,
    TCP_USER_TIMEOUT,
} from './config';

declare module './websocket' {
    interface Websocket {
        sendAsync(message: string): Promise<void>;
    }
}


export class Stream extends Startable {
    private socket?: Websocket;
    private pingTimer?: NodeJS.Timeout;

    protected async _start() {
        this.socket = Bluebird.promisifyAll(new Websocket(OKEX_WEBSOCKET_URL));
        const [res] = <[IncomingMessage]>await once(this.socket, 'upgrade');
        setUserTimeout(res.socket, TCP_USER_TIMEOUT);
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
        await this.socket!.sendAsync(JSON.stringify(object));
    }
}
