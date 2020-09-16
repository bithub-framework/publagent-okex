import Normalizer from './normalizer';
import {
    RawTrade,
    RawOrderbook,
    Trade,
    Orderbook,
    Action,
    RawOrder,
    Order,
} from './interfaces';
import _ from 'lodash';
const { flow: pipe } = _;

function normalizeRawOrder(rawOrder: RawOrder, action: Action): Order {
    return {
        action,
        price: pipe(
            Number.parseFloat,
            x => x * 100,
            Math.round,
        )(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
}

class BtcUsdt extends Normalizer {
    protected pair = 'BTC/USDT';
    protected rawTradesChannel = 'spot/trade:BTC-USDT';
    protected rawOrderbookChannel = 'spot/depth5:BTC-USDT';
    protected instrumentId = 'BTC-USDT';

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        return {
            action: rawTrade.side === 'buy' ? Action.BID : Action.ASK,
            price: pipe(
                Number.parseFloat,
                x => x * 100,
                Math.round,
            )(rawTrade.price),
            amount: Number.parseFloat(rawTrade.size),
            time: new Date(rawTrade.timestamp).getTime(),
            id: Number.parseInt(rawTrade.trade_id),
        };
    }

    protected normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook {
        return {
            asks: rawOrderbook.asks
                .map(rawOrder => normalizeRawOrder(rawOrder, Action.ASK)),
            bids: rawOrderbook.bids
                .map(rawOrder => normalizeRawOrder(rawOrder, Action.BID)),
            time: Date.parse(rawOrderbook.timestamp),
        };
    }
}

export {
    BtcUsdt as default,
    BtcUsdt,
}
