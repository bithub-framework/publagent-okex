"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const incremental_1 = __importDefault(require("./incremental"));
const interfaces_1 = require("./interfaces");
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
class RawOrderbookHandler {
    constructor(isPerpetual = false) {
        this.isPerpetual = isPerpetual;
        this.incremental = new incremental_1.default(this.isPerpetual);
    }
    handle(raw) {
        const ordersString = formatRawOrderbookToOrdersString(raw);
        ordersString.forEach(orderString => void this.incremental.update(orderString));
        const orderbook = this.incremental.getLatest(raw.checksum);
        return orderbook;
    }
}
exports.RawOrderbookHandler = RawOrderbookHandler;
exports.default = RawOrderbookHandler;
//# sourceMappingURL=raw-orderbook-handler.js.map