import { Extractor } from './extractor';
import { RawTradesMessage, RawOrderbookMessage, Trade, Orderbook } from './interfaces';
export declare class OkexSpotBtcUsdt extends Extractor {
    mid: string;
    protected rawInstrumentId: string;
    protected normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade;
    protected normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook;
}
