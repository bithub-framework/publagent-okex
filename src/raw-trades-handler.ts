import _ from 'lodash';
import {
    RawTrades,
    Trade,
    Action,
} from './interfaces';
import {
    marketDescriptors,
    Pair,
} from './market-descriptions';
const { flow: pipe } = _;

class RawTradesHandler {
    constructor(private pair: Pair) { }

    public static normalizeRawTrade(
        pair: Pair,
        rawTrades: RawTrades['data'][0],
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
        trade.amount = marketDescriptors[pair].normalizeAmount(trade.price, trade.amount);
        return trade;
    }

    public handle(rawTrades: RawTrades['data']): Trade[] {
        return rawTrades.map(rawTrade =>
            RawTradesHandler.normalizeRawTrade(this.pair, rawTrade)
        );
    }
}

export {
    RawTradesHandler as default,
    RawTradesHandler,
};