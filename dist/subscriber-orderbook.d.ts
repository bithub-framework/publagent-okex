/// <reference types="node" />
import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
declare class SubscriberOrderbook extends EventEmitter {
    private okex;
    private incremental;
    constructor(okex: V3WebsocketClient);
    private onOrderbookSub;
    private subscribe;
    private onOrderbookData;
}
export default SubscriberOrderbook;
