import Normalizer from './normalizer';
function normalizeRawOrder(rawOrder, side) {
    const order = {
        side,
        price: Number.parseFloat(rawOrder[0]),
        quantity: Number.parseInt(rawOrder[1]),
    };
    return order;
}
class BtcUsdt extends Normalizer {
    constructor() {
        super(...arguments);
        this.pair = 'BTC-USD-SWAP/USD';
        this.rawInstrumentId = 'BTC-USD-SWAP';
        this.rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
        this.rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';
    }
    normalizeRawTrade(rawTrade) {
        const trade = {
            side: rawTrade.side,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseInt(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
        return trade;
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
//# sourceMappingURL=btc-usd-swap-usd.js.map