/// <reference types="node" />
import { Startable, StartableLike } from 'startable';
import { Stream } from './stream';
import { EventEmitter } from 'events';
import { Trade, Orderbook, RawOrderbookMessage, RawTradesMessage } from './interfaces';
export interface ExtractorLike extends StartableLike {
    mid: string;
}
export interface ExtractorConstructor {
    new (stream: Stream, broadcast: EventEmitter): ExtractorLike;
}
export declare abstract class Extractor extends Startable implements ExtractorLike {
    private stream;
    private broadcast;
    protected abstract normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook;
    abstract mid: string;
    protected abstract rawInstrumentId: string;
    constructor(stream: Stream, broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private subscriptionOperate;
}
