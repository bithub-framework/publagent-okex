"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("interfaces");
function formatTrades(trades) {
    return trades.map(trade => ({
        action: trade.side === 'buy' ? interfaces_1.Action.BID : interfaces_1.Action.ASK,
        price: Number.parseFloat(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
    })).reverse();
}
exports.formatTrades = formatTrades;
function formatOrder(rawOrder, action) {
    const order = {
        action,
        price: Number.parseFloat(rawOrder[0]),
        amount: Number.parseFloat(rawOrder[1]),
    };
    return {
        order,
        raw: [rawOrder[0], rawOrder[1]],
    };
}
exports.formatOrder = formatOrder;
function formatOrderbook(orderbook) {
    return [
        ...orderbook.bids.map((rawOrder) => formatOrder(rawOrder, interfaces_1.Action.BID)),
        ...orderbook.asks.map((rawOrder) => formatOrder(rawOrder, interfaces_1.Action.ASK)),
    ];
}
exports.formatOrderbook = formatOrderbook;
//# sourceMappingURL=format.js.map