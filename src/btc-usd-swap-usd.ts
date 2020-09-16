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

function normalizeAmount(price: number, amount: number) {
    return amount * 100 * 100 / price
}

function normalizeRawOrder(rawOrder: RawOrder, action: Action): Order {
    const order = {
        action,
        price: pipe(
            Number.parseFloat,
            x => x * 100,
            Math.round,
        )(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
    order.amount = normalizeAmount(order.price, order.amount);
    return order;
}

class BtcUsdt extends Normalizer {
    protected pair = 'BTC-USD-SWAP/USD';
    protected instrumentId = 'BTC-USD-SWAP';
    protected rawTradesChannel = `swap/trade:${this.instrumentId}`;
    protected rawOrderbookChannel = `swap/depth5:${this.instrumentId}`;

    protected normalizeRawTrade(rawTrade: RawTrade): Trade {
        const trade = {
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
        trade.amount = normalizeAmount(trade.price, trade.amount);
        return trade;
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
