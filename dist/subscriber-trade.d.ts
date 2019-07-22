/**
 * 跟 subscriber-depth 差不多
 */
/// <reference types="node" />
import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
declare enum States {
    SUBSCRIBING = 0,
    SUBSCRIBED = 1,
    UNSUBSCRIBING = 2,
    UNSUBSCRIBED = 3,
    DESTRUCTING = "destructing"
}
declare class SubscriberTrade extends EventEmitter {
    private okex;
    static States: typeof States;
    private state;
    constructor(okex: V3WebsocketClient);
    private onOkexClose;
    destructor(): void;
    private onTradeSub;
    subscribe(): Promise<void>;
    private onTradeUnsub;
    unsubscribe(): Promise<void>;
    private onData;
}
export default SubscriberTrade;
