import Normalizer from './normalizer';
import {
    RawTrade,
    RawOrderbook,
    Trade,
    Orderbook,
    Side, BID, ASK,
    RawOrder,
    MakerOrder,
} from './interfaces';
import Big from 'big.js';

function normalizeRawOrder(rawOrder: RawOrder, side: Side): MakerOrder {
    return {
        price: new Big(rawOrder[0]),
        quantity: new Big(rawOrder[1]),
        side,
    };
}

class BtcUsdSwapUsd extends Normalizer {
    protected pair = 'btc-usd-swap/usd';
    protected rawInstrumentId = 'BTC-USD-SWAP';
    protected rawTradesChannel = 'swap/trade:BTC-USD-SWAP';
    protected rawOrderbookChannel = 'swap/depth5:BTC-USD-SWAP';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        return {
            side: rawTrade.side === 'buy' ? BID : ASK,
            price: new Big(rawTrade.price),
            quantity: new Big(rawTrade.size),
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
    BtcUsdSwapUsd as default,
    BtcUsdSwapUsd,
}
