/**
 * 跟 subscriber-depth 差不多
 * 不处理 error 响应，也不处理 okex 关闭，留给 index 统一处理。
 */
/// <reference types="node" />
import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
declare class SubscriberTrades extends EventEmitter {
    private okex;
    constructor(okex: V3WebsocketClient);
    private onTradesSub;
    private subscribe;
    private onTradesData;
}
export default SubscriberTrades;
