/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class V3WebsocketClient extends EventEmitter {
    private websocketUri;
    private socket?;
    private interval?;
    constructor(websocketURI?: string);
    connect(): void;
    login(apiKey: string, apiSecret: string, passphrase: string): void;
    subscribe(...args: string[]): void;
    unsubscribe(...args: string[]): void;
    checksum(data: any): boolean;
    private send;
    private onOpen;
    private initTimer;
    private resetTimer;
    private onMessage;
    private onClose;
    close(): void;
}
export default V3WebsocketClient;
