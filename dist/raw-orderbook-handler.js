"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const incremental_1 = __importDefault(require("./incremental"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const interfaces_1 = require("./interfaces");
const config = fs_extra_1.readJsonSync(path_1.join(__dirname, '../cfg/config.json'));
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
        const fullOrderbook = this.incremental.getLatest(raw.checksum);
        const orderbook = {
            bids: fullOrderbook.bids.slice(0, config.ORDERBOOK_DEPTH),
            asks: fullOrderbook.asks.slice(0, config.ORDERBOOK_DEPTH),
        };
        return orderbook;
    }
}
exports.RawOrderbookHandler = RawOrderbookHandler;
exports.default = RawOrderbookHandler;
//# sourceMappingURL=raw-orderbook-handler.js.map