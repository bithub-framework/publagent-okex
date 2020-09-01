/// <reference types="node" />
import Startable from 'startable';
declare class PassiveClose extends Error {
    constructor();
}
declare class PromisifiedWebSocket extends Startable {
    private url;
    private socket?;
    constructor(url: string);
    protected _start(): Promise<void>;
    protected _stop(err?: Error): Promise<void>;
    send(message: string | Buffer): Promise<void>;
}
export { PromisifiedWebSocket as default, PromisifiedWebSocket, PassiveClose, };
