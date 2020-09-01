import WebSocket from 'ws';
import Startable from 'startable';
import { promisify } from 'util';
import { once } from 'events';

class PassiveClose extends Error {
    constructor() {
        super('Passive close');
    }
}

class PromisifiedWebSocket extends Startable {
    private socket?: WebSocket;

    constructor(private url: string) {
        super();
    }

    protected async _start() {
        this.socket = new WebSocket(this.url);
        // args
        this.socket.on('close', () => this.stop(new PassiveClose()));
        this.socket.on('message', message => void this.emit('message', message));
        this.socket.on('error', err => this.emit('error', err));
        await once(this.socket, 'open');
    }

    protected async _stop(err?: Error) {
        if (!err) {
            this.socket!.close();
            await once(this.socket!, 'close');
        }
    }

    // TODO
    public async send(message: string | Buffer): Promise<void> {
        await promisify(this.socket!.send.bind(this.socket))(message);
    }
}

export {
    PromisifiedWebSocket as default,
    PromisifiedWebSocket,
    PassiveClose,
}