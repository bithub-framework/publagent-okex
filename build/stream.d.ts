import { Startable } from 'startable';
export declare class Stream extends Startable {
    private socket?;
    private pingTimer?;
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    send(object: {}): Promise<void>;
}
