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
        price: Number.parseFloat(rawOrder[0]),
        quantity: Number.parseInt(rawOrder[1]),
    };
}

class BtcUsdSwapUsd extends Normalizer {
    protected pair = 'btc-usd-swap/usd';
    protected rawInstrumentId = 'BTC-USD-SWAP';
    protected rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
    protected rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        return {
            side: rawTrade.side === 'buy' ? Side.BID : Side.ASK,
            price: Number.parseFloat(rawTrade.price),
            quantity: Number.parseInt(rawTrade.size),
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
    BtcUsdSwapUsd as default,
    BtcUsdSwapUsd,
}
