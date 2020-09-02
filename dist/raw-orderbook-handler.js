import Incremental from './incremental';
function formatRawOrderToStringOrder(rawOrder, action) {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}
function formatRawOrderbookToStringOrders(rawOrderbook) {
    return [
        ...rawOrderbook.bids.map(rawOrder => formatRawOrderToStringOrder(rawOrder, "bid" /* BID */)),
        ...rawOrderbook.asks.map(rawOrder => formatRawOrderToStringOrder(rawOrder, "ask" /* ASK */)),
    ];
}
class RawOrderbookHandler {
    constructor(pair) {
        this.pair = pair;
        this.incremental = new Incremental(this.pair);
    }
    handle(rawOrderbook) {
        const ordersString = formatRawOrderbookToStringOrders(rawOrderbook);
        ordersString.forEach(orderString => void this.incremental.update(orderString, rawOrderbook.timestamp));
        return this.incremental.getLatest(rawOrderbook.checksum);
    }
}
export { RawOrderbookHandler as default, RawOrderbookHandler, };
//# sourceMappingURL=raw-orderbook-handler.js.map