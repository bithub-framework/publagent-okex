import { flow as pipe } from 'lodash';
import {
    RawTrades,
    Trade,
    Action,
} from './interfaces';

function formatRawTrades(rawTrades: RawTrades): Trade[] {
    const trades = rawTrades.data;
    return trades.map(trade => ({
        action: trade.side === 'buy' ? Action.BID : Action.ASK,
        price: pipe(
            Number.parseFloat,
            x => x * 100,
            Math.round,
        )(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
        id: Number.parseInt(trade.trade_id),
    }));
}

export {
    formatRawTrades,
};