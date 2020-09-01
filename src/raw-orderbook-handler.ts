import Incremental from './incremental';
import {
    Orderbook,
    RawOrderbook,
    StringOrder,
    Action,
} from './interfaces';
import config from './config';
import { Pair } from './market-descriptions';

function formatRawOrderToStringOrder(
    rawOrder: RawOrderbook['data'][0]['asks'][0],
    action: Action
): StringOrder {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}

function formatRawOrderbookToStringOrders(
    orderbook: RawOrderbook['data'][0]
): StringOrder[] {
    return [
        ...orderbook.bids.map(rawOrder =>
            formatRawOrderToStringOrder(rawOrder, Action.BID)),
        ...orderbook.asks.map(rawOrder =>
            formatRawOrderToStringOrder(rawOrder, Action.ASK)),
    ]
}

class RawOrderbookHandler {
    private incremental = new Incremental(this.pair);

    constructor(private pair: Pair) { }

    public handle(raw: RawOrderbook['data'][0]): Orderbook {
        const ordersString = formatRawOrderbookToStringOrders(raw);
        ordersString.forEach(orderString =>
            void this.incremental.update(orderString, raw.timestamp));

        const fullOrderbook = this.incremental.getLatest(raw.checksum);
        const orderbook: Orderbook = {
            bids: fullOrderbook.bids.slice(0, config.ORDERBOOK_DEPTH),
            asks: fullOrderbook.asks.slice(0, config.ORDERBOOK_DEPTH),
            time: fullOrderbook.time,
        }
        return orderbook;
    }
}

export default RawOrderbookHandler;
export { RawOrderbookHandler };