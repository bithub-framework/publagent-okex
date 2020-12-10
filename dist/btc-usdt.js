import Normalizer from './normalizer';
function normalizeRawOrder(rawOrder) {
    return {
        price: Number.parseFloat(rawOrder[1]),
        quantity: Number.parseFloat(rawOrder[1]),
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
            side: rawTrade.side === 'buy' ? 0 /* BID */ : 1 /* ASK */,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
    }
    normalizeRawOrderbook(rawOrderbook) {
        return {
            [1 /* ASK */]: rawOrderbook.asks.map(normalizeRawOrder),
            [0 /* BID */]: rawOrderbook.bids.map(normalizeRawOrder),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}
export { BtcUsdt as default, BtcUsdt, };
//# sourceMappingURL=btc-usdt.js.map