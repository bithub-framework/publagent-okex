/// <reference types="node" />
import Startable from 'startable';
import Deserializer from './deserializer';
import EventEmitter from 'events';
import { Trade, RawTrade, Orderbook, RawOrderbook } from './interfaces';
declare abstract class Normalizer extends Startable {
    private deserializer;
    private broadcast;
    protected abstract normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
    protected abstract pair: string;
    protected abstract rawTradesChannel: string;
    protected abstract rawOrderbookChannel: string;
    protected abstract instrumentId: string;
    constructor(deserializer: Deserializer, broadcast: EventEmitter);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
    private _onRawDataTrades;
    private _onRawDataOrderbook;
    private onRawTrades;
    private onRawOrderbook;
    private unSubscribe;
}
export { Normalizer as default, Normalizer, };
