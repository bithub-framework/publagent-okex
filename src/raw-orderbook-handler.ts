import {
    Incremental,
    formatStringOrderToOrder,
} from './incremental';
import {
    Orderbook,
    StringOrder,
    Action,
    RawOrderbook,
    RawOrder,
} from './interfaces';
import { Pair } from './market-descriptions';

function formatRawOrderToStringOrder(
    rawOrder: RawOrder,
    action: Action
): StringOrder {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}

function formatRawOrderbookToStringOrders(
    rawOrderbook: RawOrderbook,
): StringOrder[] {
    return [
        ...rawOrderbook.bids.map(rawOrder =>
            formatRawOrderToStringOrder(rawOrder, Action.BID)),
        ...rawOrderbook.asks.map(rawOrder =>
            formatRawOrderToStringOrder(rawOrder, Action.ASK)),
    ]
}

class RawOrderbookHandler {
    private incremental = new Incremental(this.pair);

    constructor(private pair: Pair) { }

    public handle(rawOrderbook: RawOrderbook): Orderbook {
        const stringOrders = formatRawOrderbookToStringOrders(rawOrderbook);
        stringOrders.forEach(orderString =>
            void this.incremental.update(orderString, rawOrderbook.timestamp));

        return this.incremental.getLatest(rawOrderbook.checksum);
    }

    public handleStock(rawOrderbook: RawOrderbook): Orderbook {
        return {
            asks: rawOrderbook.asks
                .map(rawOrder => formatRawOrderToStringOrder(rawOrder, Action.ASK))
                .map(stringOrder => formatStringOrderToOrder(this.pair, stringOrder)),
            bids: rawOrderbook.bids
                .map(rawOrder => formatRawOrderToStringOrder(rawOrder, Action.BID))
                .map(stringOrder => formatStringOrderToOrder(this.pair, stringOrder)),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}

export {
    RawOrderbookHandler as default,
    RawOrderbookHandler,
};