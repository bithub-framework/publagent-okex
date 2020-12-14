import Normalizer from './normalizer';
import { BID, ASK, } from './interfaces';
function normalizeRawOrder(rawOrder, side) {
    return {
        price: Number.parseFloat(rawOrder[0]),
        quantity: Number.parseInt(rawOrder[1]),
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
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseInt(rawTrade.size),
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