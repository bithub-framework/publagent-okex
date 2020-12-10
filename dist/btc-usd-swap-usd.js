import Normalizer from './normalizer';
function normalizeRawOrder(rawOrder) {
    return {
        price: Number.parseFloat(rawOrder[0]),
        quantity: Number.parseInt(rawOrder[1]),
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
            side: rawTrade.side === 'buy' ? 0 /* BID */ : 1 /* ASK */,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseInt(rawTrade.size),
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
export { BtcUsdSwapUsd as default, BtcUsdSwapUsd, };
//# sourceMappingURL=btc-usd-swap-usd.js.map