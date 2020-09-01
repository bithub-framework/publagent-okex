import { RawTrades, Trade } from './interfaces';
import { Pair } from './market-descriptions';
declare class RawTradesHandler {
    private pair;
    constructor(pair: Pair);
    static normalizeRawTrade(pair: Pair, rawTrades: RawTrades['data'][0]): Trade;
    handle(rawTrades: RawTrades['data']): Trade[];
}
export { RawTradesHandler as default, RawTradesHandler, };
