/// <reference types="node" />
import { Startable } from 'startable';
import { Stream } from './stream';
import { EventEmitter } from 'events';
import { Trade, Orderbook, RawOrderbookMessage, RawTradesMessage } from './interfaces';
export interface ExtractorConstructor {
    new (stream: Stream, broadcast: EventEmitter): Extractor;
}
export declare abstract class Extractor extends Startable {
    private stream;
    private broadcast;
    protected abstract normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook;
    protected abstract mid: string;
    protected abstract rawInstrumentId: string;
    private server?;
    constructor(stream: Stream, broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private subscriptionOperate;
}
