import Normalizer from './normalizer';
import {
    RawTrade,
    RawOrderbook,
    Trade,
    Orderbook,
    Side,
    RawOrder,
    OrderbookItem,
} from './interfaces';

function normalizeRawOrder(rawOrder: RawOrder): OrderbookItem {
    return {
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
            side: rawTrade.side === 'buy' ? Side.BID : Side.ASK,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: rawTrade.trade_id,
        };
    }

    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook {
        return {
            [Side.ASK]: rawOrderbook.asks.map(normalizeRawOrder),
            [Side.BID]: rawOrderbook.bids.map(normalizeRawOrder),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}

export {
    BtcUsdt as default,
    BtcUsdt,
}
