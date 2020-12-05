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
    return {
        side,
        price: Number.parseFloat(rawOrder[1]),
        quantity: Number.parseFloat(rawOrder[1]),
    };
}

class BtcUsdt extends Normalizer {
    protected pair = 'btc/usdt';
    protected rawInstrumentId = 'BTC-USDT';
    protected rawTradesChannel = 'spot/trade:BTC-USDT';
    protected rawOrderbookChannel = 'spot/depth5:BTC-USDT';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        return {
            side: rawTrade.side,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
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
