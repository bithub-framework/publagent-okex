import { Extractor } from './extractor';
import {
    Trade,
    Orderbook,
    Side,
    RawTradesMessage,
    RawOrderbookMessage,
    BookOrder,
} from './interfaces';
import Big from 'big.js';

function normalizeRawOrder(rawBookOrder: RawOrderbookMessage['data'][0]['asks'][0], side: Side): BookOrder {
    return {
        price: new Big(rawBookOrder[0]),
        quantity: new Big(rawBookOrder[1]),
        side,
    };
}

export class OkexPerpetualBtcUsdt extends Extractor {
    public mid = 'okex-perpetual-btc-usdt';
    protected rawInstrumentId = 'BTC-USD-SWAP';

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
            [Side.ASK]: rawOrderbook.asks.map(rawOrder => normalizeRawOrder(rawOrder, Side.ASK)),
            [Side.BID]: rawOrderbook.bids.map(rawOrder => normalizeRawOrder(rawOrder, Side.BID)),
            time: Number.parseInt(rawOrderbook.ts),
        };
    }
}
