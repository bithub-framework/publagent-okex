import { flow as pipe } from 'lodash';
import {
    RawTrades,
    Trade,
    Action,
} from './interfaces';

function formatRawTrade(
    rawTrades: RawTrades['data'][0],
    isPerpetual = false,
): Trade {
    const trade = {
        action: rawTrades.side === 'buy' ? Action.BID : Action.ASK,
        price: pipe(
            Number.parseFloat,
            x => x * 100,
            Math.round,
        )(rawTrades.price),
        amount: Number.parseFloat(rawTrades.size),
        time: new Date(rawTrades.timestamp).getTime(),
        id: Number.parseInt(rawTrades.trade_id),
    };
    if (isPerpetual) {
        trade.amount *= 100 * 100 / trade.price;
    }
    return trade;
}

export default formatRawTrade;
export {
    formatRawTrade,
};