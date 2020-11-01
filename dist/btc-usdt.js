import Normalizer from './normalizer';
function normalizeRawOrder(rawOrder, side) {
    return {
        side,
        price: Number.parseFloat(rawOrder[1]),
        quantity: Number.parseFloat(rawOrder[1]),
    };
}
class BtcUsdt extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'BTC/USDT';
        this.rawInstrumentId = 'BTC-USDT';
        this.rawTradesChannel = 'spot/trade:BTC-USDT';
        this.rawOrderbookChannel = 'spot/depth5:BTC-USDT';
    }
    normalizeRawTrade(rawTrade) {
        return {
            side: rawTrade.side,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
    }
    normalizeRawOrderbook(rawOrderbook) {
        return {
            asks: rawOrderbook.asks
                .map(rawOrder => normalizeRawOrder(rawOrder, 'sell')),
            bids: rawOrderbook.bids
                .map(rawOrder => normalizeRawOrder(rawOrder, 'buy')),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}
export { BtcUsdt as default, BtcUsdt, };
//# sourceMappingURL=btc-usdt.js.map