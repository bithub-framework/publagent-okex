import Normalizer from './normalizer';
import { RawTrade, RawOrderbook, Trade, Orderbook } from './interfaces';
declare class BtcUsdSwapUsd extends Normalizer {
    protected pair: string;
    protected rawInstrumentId: string;
    protected rawTradesChannel: string;
    protected rawOrderbookChannel: string;
    protected normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
}
export { BtcUsdSwapUsd as default, BtcUsdSwapUsd, };
