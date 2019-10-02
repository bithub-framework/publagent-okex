"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("interfaces");
function formatRawTrades(trades) {
    return trades.map(trade => ({
        action: trade.side === 'buy' ? interfaces_1.Action.BID : interfaces_1.Action.ASK,
        price: Number.parseFloat(trade.price),
        amount: Number.parseFloat(trade.size),
        time: new Date(trade.timestamp).getTime(),
        id: Number.parseInt(trade.trade_id),
    }));
}
exports.formatRawTrades = formatRawTrades;
function formatRawOrderToOrderString(rawOrder, action) {
    return {
        action,
        price: rawOrder[0],
        amount: rawOrder[1],
    };
}
function formatRawOrderbookToOrdersString(orderbook) {
    return [
        ...orderbook.bids.map(rawOrder => formatRawOrderToOrderString(rawOrder, interfaces_1.Action.BID)),
        ...orderbook.asks.map(rawOrder => formatRawOrderToOrderString(rawOrder, interfaces_1.Action.ASK)),
    ];
}
exports.formatRawOrderbookToOrdersString = formatRawOrderbookToOrdersString;
//# sourceMappingURL=format.js.map