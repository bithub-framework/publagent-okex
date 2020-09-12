import { RawTrade, Trade } from './interfaces';
import { Pair } from './mappings';
declare class RawTradesHandler {
    private pair;
    constructor(pair: Pair);
    static normalizeRawTrade(pair: Pair, rawTrades: RawTrade): Trade;
    handle(rawTrades: RawTrade[]): Trade[];
}
export { RawTradesHandler as default, RawTradesHandler, };
