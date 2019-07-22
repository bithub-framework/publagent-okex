/**
 * 语义上，订阅与取关属于运行过程的一部分，而不属于构造析构过程。
 * 所以订阅与取关时发生的错误，不属于构造析构异常。
 *
 * 这是一个自治对象，以下情况会使它自动析构
 *
 * - 订阅与取关时发生错误。
 * - okex 关闭。
 *
 * 析构之后，订阅状态是不确定的。
 *
 * 有以下事件
 *
 * - 5 个状态
 * - data
 * - error
 * - checksum error
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
declare class SubscriberDepth extends EventEmitter {
    private okex;
    static States: typeof States;
    private state;
    private incremental;
    constructor(okex: V3WebsocketClient);
    private destructor;
    private onOkexClose;
    private onChecksumError;
    private onDepthSub;
    private subscribe;
    private onDepthUnsub;
    private unsubscribe;
    private onData;
    private updateOrders;
}
export default SubscriberDepth;
