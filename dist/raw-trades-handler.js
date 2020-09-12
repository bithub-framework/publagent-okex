import _ from 'lodash';
import { marketDescriptors, } from './mappings';
const { flow: pipe } = _;
class RawTradesHandler {
    constructor(pair) {
        this.pair = pair;
    }
    static normalizeRawTrade(pair, rawTrades) {
        const trade = {
            action: rawTrades.side === 'buy' ? "bid" /* BID */ : "ask" /* ASK */,
            price: pipe(Number.parseFloat, x => x * 100, Math.round)(rawTrades.price),
            amount: Number.parseFloat(rawTrades.size),
            time: new Date(rawTrades.timestamp).getTime(),
            id: Number.parseInt(rawTrades.trade_id),
        };
        trade.amount = marketDescriptors[pair].normalizeAmount(trade.price, trade.amount);
        return trade;
    }
    handle(rawTrades) {
        return rawTrades.map(rawTrade => RawTradesHandler.normalizeRawTrade(this.pair, rawTrade));
    }
}
export { RawTradesHandler as default, RawTradesHandler, };
//# sourceMappingURL=raw-trades-handler.js.map