/// <reference types="node" />
import Startable from 'startable';
import { EventEmitter } from 'events';
declare class WsServer extends Startable {
    private broadcast;
    private httpServer;
    private koa;
    private router;
    private wsFilter;
    constructor(broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
export { WsServer as default, WsServer, };
