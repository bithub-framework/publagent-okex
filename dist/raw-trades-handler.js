"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const interfaces_1 = require("./interfaces");
function formatRawTrade(rawTrades, isPerpetual = false) {
    const trade = {
        action: rawTrades.side === 'buy' ? interfaces_1.Action.BID : interfaces_1.Action.ASK,
        price: lodash_1.flow(Number.parseFloat, x => x * 100, Math.round)(rawTrades.price),
        amount: Number.parseFloat(rawTrades.size),
        time: new Date(rawTrades.timestamp).getTime(),
        id: Number.parseInt(rawTrades.trade_id),
    };
    if (isPerpetual) {
        trade.amount *= 100 * 100 / trade.price;
    }
    return trade;
}
exports.formatRawTrade = formatRawTrade;
exports.default = formatRawTrade;
//# sourceMappingURL=raw-trades-handler.js.map