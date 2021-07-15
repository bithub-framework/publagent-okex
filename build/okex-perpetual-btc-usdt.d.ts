import { Extractor } from './extractor';
import { Trade, Orderbook, RawTradesMessage, RawOrderbookMessage } from './interfaces';
export declare class OkexPerpetualBtcUsdt extends Extractor {
    mid: string;
    protected rawInstrumentId: string;
    protected normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade;
    protected normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook;
}
