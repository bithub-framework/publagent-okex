import Incremental from './incremental';
import {
    Orderbook,
    RawOrderbook,
    OrderString,
    Action,
} from './interfaces';

function formatRawOrderToOrderString(
    rawOrder: RawOrderbook['data'][0]['asks'][0],
    action: Action
): OrderString {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}

function formatRawOrderbookToOrdersString(
    orderbook: RawOrderbook['data'][0]
): OrderString[] {
    return [
        ...orderbook.bids.map(rawOrder =>
            formatRawOrderToOrderString(rawOrder, Action.BID)),
        ...orderbook.asks.map(rawOrder =>
            formatRawOrderToOrderString(rawOrder, Action.ASK)),
    ]
}

class RawOrderbookHandler {
    private incremental = new Incremental();

    public handle(raw: RawOrderbook): Orderbook {
        const ordersString = formatRawOrderbookToOrdersString(raw.data[0]);
        ordersString.forEach(orderString =>
            void this.incremental.update(orderString));

        const orderbook = this.incremental.getLatest(
            raw.data[0].checksum);
        return orderbook;
    }
}

export default RawOrderbookHandler;