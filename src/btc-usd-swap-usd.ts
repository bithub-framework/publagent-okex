import Normalizer from './normalizer';
import {
    RawTrade,
    RawOrderbook,
    Trade,
    Orderbook,
    Side,
    RawOrder,
    Order,
} from './interfaces';

function normalizeRawOrder(rawOrder: RawOrder, side: Side): Order {
    const order = {
        side,
        price: Number.parseFloat(rawOrder[0]),
        quantity: Number.parseInt(rawOrder[1]),
    };
    return order;
}

class BtcUsdt extends Normalizer {
    protected pair = 'BTC-USD-SWAP/USD';
    protected rawInstrumentId = 'BTC-USD-SWAP';
    protected rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
    protected rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        const trade = {
            side: rawTrade.side,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseInt(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
        return trade;
    }

    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook {
        return {
            asks: rawOrderbook.asks
                .map(rawOrder => normalizeRawOrder(rawOrder, 'sell')),
            bids: rawOrderbook.bids
                .map(rawOrder => normalizeRawOrder(rawOrder, 'buy')),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}

export {
    BtcUsdt as default,
    BtcUsdt,
}
