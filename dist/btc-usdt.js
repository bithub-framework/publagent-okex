import Normalizer from './normalizer';
import _ from 'lodash';
const { flow: pipe } = _;
function normalizeRawOrder(rawOrder, action) {
    return {
        action,
        price: pipe(Number.parseFloat, x => x * 100, Math.round)(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
}
class BtcUsdt extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'BTC/USDT';
        this.rawTradesChannel = 'spot/trade:BTC-USDT';
        this.rawOrderbookChannel = 'spot/depth5:BTC-USDT';
        this.instrumentId = 'BTC-USDT';
    }
    normalizeRawTrade(rawTrade) {
        return {
            action: rawTrade.side === 'buy' ? "bid" /* BID */ : "ask" /* ASK */,
            price: pipe(Number.parseFloat, x => x * 100, Math.round)(rawTrade.price),
            amount: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: Number.parseInt(rawTrade.trade_id),
        };
    }
    normalizeRawOrderbook(rawOrderbook) {
        return {
            asks: rawOrderbook.asks
                .map(rawOrder => normalizeRawOrder(rawOrder, "ask" /* ASK */)),
            bids: rawOrderbook.bids
                .map(rawOrder => normalizeRawOrder(rawOrder, "bid" /* BID */)),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}
export { BtcUsdt as default, BtcUsdt, };
//# sourceMappingURL=btc-usdt.js.map