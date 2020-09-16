import Normalizer from './normalizer';
import { RawTrade, RawOrderbook, Trade, Orderbook } from './interfaces';
declare class BtcUsdt extends Normalizer {
    protected pair: string;
    protected rawTradesChannel: string;
    protected rawOrderbookChannel: string;
    protected instrumentId: string;
    protected normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
}
export { BtcUsdt as default, BtcUsdt, };
