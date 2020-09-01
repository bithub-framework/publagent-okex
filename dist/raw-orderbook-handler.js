import Incremental from './incremental';
import config from './config';
function formatRawOrderToStringOrder(rawOrder, action) {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}
function formatRawOrderbookToStringOrders(orderbook) {
    return [
        ...orderbook.bids.map(rawOrder => formatRawOrderToStringOrder(rawOrder, "bid" /* BID */)),
        ...orderbook.asks.map(rawOrder => formatRawOrderToStringOrder(rawOrder, "ask" /* ASK */)),
    ];
}
class RawOrderbookHandler {
    constructor(pair) {
        this.pair = pair;
        this.incremental = new Incremental(this.pair);
    }
    handle(raw) {
        const ordersString = formatRawOrderbookToStringOrders(raw);
        ordersString.forEach(orderString => void this.incremental.update(orderString, raw.timestamp));
        const fullOrderbook = this.incremental.getLatest(raw.checksum);
        const orderbook = {
            bids: fullOrderbook.bids.slice(0, config.ORDERBOOK_DEPTH),
            asks: fullOrderbook.asks.slice(0, config.ORDERBOOK_DEPTH),
            time: fullOrderbook.time,
        };
        return orderbook;
    }
}
export default RawOrderbookHandler;
export { RawOrderbookHandler };
//# sourceMappingURL=raw-orderbook-handler.js.map