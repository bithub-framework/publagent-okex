/// <reference types="node" />
import { Startable } from 'startable';
import { EventEmitter } from 'events';
export declare class Server extends Startable {
    private mid;
    private broadcast;
    private httpServer;
    private koa;
    private router;
    private filter;
    constructor(mid: string, broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
