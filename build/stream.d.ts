import { Startable } from 'startable';
declare module './websocket' {
    interface Websocket {
        sendAsync(message: string): Promise<void>;
    }
}
export declare class Stream extends Startable {
    private socket?;
    private pingTimer?;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    send(object: {}): Promise<void>;
}
