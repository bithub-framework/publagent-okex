/// <reference types="node" />
import Startable from 'startable';
import Deserializer from './deserializer';
import { EventEmitter } from 'events';
import { Trade, RawTrade, Orderbook, RawOrderbook } from './interfaces';
declare abstract class Normalizer extends Startable {
    private deserializer;
    private broadcast;
    protected abstract normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
    protected abstract pair: string;
    protected abstract rawTradesChannel: string;
    protected abstract rawOrderbookChannel: string;
    protected abstract rawInstrumentId: string;
    constructor(deserializer: Deserializer, broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private _onRawTrades;
    private _onRawOrderbook;
    private onRawTrades;
    private onRawOrderbook;
    private unSubscribe;
}
export { Normalizer as default, Normalizer, };
