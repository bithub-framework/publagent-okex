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
    constructor(url) {
        super();
        this.url = url;
    }
    async _start() {
        this.socket = new WebSocket(this.url);
        // args
        this.socket.on('close', () => this.stop(new PassiveClose()));
        this.socket.on('message', message => void this.emit('message', message));
        this.socket.on('error', err => this.emit('error', err));
        await once(this.socket, 'open');
    }
    async _stop(err) {
        if (!err) {
            this.socket.close();
            await once(this.socket, 'close');
        }
    }
    // TODO
    async send(message) {
        await promisify(this.socket.send.bind(this.socket))(message);
    }
}
export { PromisifiedWebSocket as default, PromisifiedWebSocket, PassiveClose, };
//# sourceMappingURL=promisified-websocket.js.map