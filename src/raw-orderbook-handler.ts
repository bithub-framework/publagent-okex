import Incremental from './incremental';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';
import {
    Orderbook,
    RawOrderbook,
    OrderString,
    Action,
    Config,
} from './interfaces';

const config: Config = readJsonSync(join(__dirname,
    '../cfg/config.json'));

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
    private incremental = new Incremental(this.isPerpetual);

    constructor(private isPerpetual = false) { }

    public handle(raw: RawOrderbook['data'][0]): Orderbook {
        const ordersString = formatRawOrderbookToOrdersString(raw);
        ordersString.forEach(orderString =>
            void this.incremental.update(orderString));

        const fullOrderbook = this.incremental.getLatest(raw.checksum);
        const orderbook: Orderbook = {
            bids: fullOrderbook.bids.slice(0, config.ORDERBOOK_DEPTH),
            asks: fullOrderbook.asks.slice(0, config.ORDERBOOK_DEPTH),
        }
        return orderbook;
    }
}

export default RawOrderbookHandler;
export { RawOrderbookHandler };