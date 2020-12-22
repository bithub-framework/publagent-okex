import Normalizer from './normalizer';
import { ASK, BID, } from './interfaces';
import Big from 'big.js';
function normalizeRawOrder(rawOrder, side) {
    return {
        price: new Big(rawOrder[0]),
        quantity: new Big(rawOrder[1]),
        side,
    };
}
class BtcUsdt extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'btc/usdt';
        this.rawInstrumentId = 'BTC-USDT';
        this.rawTradesChannel = 'spot/trade:BTC-USDT';
        this.rawOrderbookChannel = 'spot/depth5:BTC-USDT';
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
export { BtcUsdt as default, BtcUsdt, };
//# sourceMappingURL=btc-usdt.js.map