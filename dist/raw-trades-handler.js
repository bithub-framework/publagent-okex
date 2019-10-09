"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const interfaces_1 = require("./interfaces");
function formatRawTrades(rawTrades) {
    const trades = rawTrades.data;
    return trades.map(trade => ({
        action: trade.side === 'buy' ? interfaces_1.Action.BID : interfaces_1.Action.ASK,
        price: lodash_1.flow(Number.parseFloat, x => x * 100, Math.round)(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
        id: Number.parseInt(trade.trade_id),
    }));
}
exports.formatRawTrades = formatRawTrades;
//# sourceMappingURL=raw-trades-handler.js.map