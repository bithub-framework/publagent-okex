import Normalizer from './normalizer';
import _ from 'lodash';
const { flow: pipe } = _;
function normalizeAmount(price, amount) {
    return amount * 100 * 100 / price;
}
function normalizeRawOrder(rawOrder, action) {
    const order = {
        action,
        price: pipe(Number.parseFloat, x => x * 100, Math.round)(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
    order.amount = normalizeAmount(order.price, order.amount);
    return order;
}
class BtcUsdt extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'BTC-USD-SWAP/USD';
        this.instrumentId = 'BTC-USD-SWAP';
        this.rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
        this.rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';
    }
    normalizeRawTrade(rawTrade) {
        const trade = {
            action: rawTrade.side === 'buy' ? "bid" /* BID */ : "ask" /* ASK */,
            price: pipe(Number.parseFloat, x => x * 100, Math.round)(rawTrade.price),
            amount: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: Number.parseInt(rawTrade.trade_id),
        };
        trade.amount = normalizeAmount(trade.price, trade.amount);
        return trade;
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
//# sourceMappingURL=btc-usd-swap-usd.js.map