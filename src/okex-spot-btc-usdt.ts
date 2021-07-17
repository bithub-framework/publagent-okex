import { Extractor } from './extractor';
import {
    RawTradesMessage,
    RawOrderbookMessage,
    Trade,
    Orderbook,
    Side,
    BookOrder,
} from './interfaces';
import Big from 'big.js';

function normalizeRawOrder(
    rawBookOrder: RawOrderbookMessage['data'][0]['asks'][0],
    side: Side,
): BookOrder {
    return {
        price: new Big(rawBookOrder[0]),
        quantity: new Big(rawBookOrder[1]),
        side,
    };
}

export class OkexSpotBtcUsdt extends Extractor {
    public mid = 'okex-spot-btc-usdt';
    protected rawInstrumentId = 'BTC-USDT';

    protected normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade {
        return {
            side: rawTrade.side === 'buy' ? Side.BID : Side.ASK,
            price: new Big(rawTrade.px),
            quantity: new Big(rawTrade.sz),
            time: Number.parseInt(rawTrade.ts),
            id: rawTrade.tradeId,
        };
    }

    protected normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook {
        return {
            [Side.ASK]: rawOrderbook.asks.map(rawBookOrder => normalizeRawOrder(rawBookOrder, Side.ASK)),
            [Side.BID]: rawOrderbook.bids.map(rawOrder => normalizeRawOrder(rawOrder, Side.BID)),
            time: Number.parseInt(rawOrderbook.ts),
        };
    }
}
