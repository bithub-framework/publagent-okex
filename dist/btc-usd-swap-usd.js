import Normalizer from './normalizer';
import { BID, ASK, } from './interfaces';
import Big from 'big.js';
function normalizeRawOrder(rawOrder, side) {
    return {
        price: new Big(rawOrder[0]),
        quantity: new Big(rawOrder[1]),
        side,
    };
}
class BtcUsdSwapUsd extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'btc-usd-swap/usd';
        this.rawInstrumentId = 'BTC-USD-SWAP';
        this.rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
        this.rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';
    }
    normalizeRawTrade(rawTrade) {
        return {
            side: rawTrade.side === 'buy' ? BID : ASK,
            price: new Big(rawTrade.price),
            quantity: new Big(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
    }
    normalizeRawOrderbook(rawOrderbook) {
        return {
            [ASK]: rawOrderbook.asks.map(rawOrder => normalizeRawOrder(rawOrder, ASK)),
            [BID]: rawOrderbook.bids.map(rawOrder => normalizeRawOrder(rawOrder, BID)),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}
export { BtcUsdSwapUsd as default, BtcUsdSwapUsd, };
//# sourceMappingURL=btc-usd-swap-usd.js.map