import Normalizer from './normalizer';
import {
    RawTrade,
    RawOrderbook,
    Trade,
    Orderbook,
    Side, ASK, BID,
    RawOrder,
    MakerOrder,
} from './interfaces';

function normalizeRawOrder(rawOrder: RawOrder, side: Side): MakerOrder {
    return {
        price: Number.parseFloat(rawOrder[1]),
        quantity: Number.parseFloat(rawOrder[1]),
        side,
    };
}

class BtcUsdt extends Normalizer {
    protected pair = 'btc/usdt';
    protected rawInstrumentId = 'BTC-USDT';
    protected rawTradesChannel = 'spot/trade:BTC-USDT';
    protected rawOrderbookChannel = 'spot/depth5:BTC-USDT';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        return {
            side: rawTrade.side === 'buy' ? BID : ASK,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
    }

    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook {
        return {
            [ASK]: rawOrderbook.asks.map(rawOrder => normalizeRawOrder(rawOrder, ASK)),
            [BID]: rawOrderbook.bids.map(rawOrder => normalizeRawOrder(rawOrder, BID)),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}

export {
    BtcUsdt as default,
    BtcUsdt,
}
