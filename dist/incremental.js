"use strict";
/**
 * 设单位时间内 k 次 update，p 次 latest 或 checksum
 * orderbook 平均 size 为 n
 * 平衡树 O(klogn + pn)
 * 哈希 O(k + pnlogn)
 * 因为 n 很小，所以直接哈希。
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("interfaces");
const lodash_1 = require("lodash");
const official_v3_websocket_client_modified_1 = __importDefault(require("./official-v3-websocket-client-modified"));
const assert_1 = __importDefault(require("assert"));
class Incremental {
    constructor(isContract) {
        this.isContract = isContract;
        this.asks = new Map();
        this.bids = new Map();
    }
    update(orderString) {
        const orderNumber = this.formatOrderStringToOrder(orderString);
        if (this.isContract) {
            orderNumber.amount *= 100 * 100 / orderNumber.price;
        }
        const orderBoth = {
            string: orderString,
            number: orderNumber,
        };
        if (orderString.action === interfaces_1.Action.ASK)
            if (orderString.amount === '0')
                this.asks.delete(orderString.price);
            else
                this.asks.set(orderString.price, orderBoth);
        else if (orderString.amount === '0')
            this.bids.delete(orderString.price);
        else
            this.bids.set(orderString.price, orderBoth);
    }
    clear() {
        this.asks.clear();
        this.bids.clear();
    }
    formatOrderStringToOrder(order) {
        return {
            action: order.action,
            price: lodash_1.flow(Number.parseFloat, x => x * 100, Math.round)(order.price),
            amount: Number.parseFloat(order.amount),
        };
    }
    getLatest(expected) {
        const sortedAsks = [...this.asks.values()]
            .sort((order1, order2) => order1.number.price - order2.number.price);
        const sortedBids = [...this.bids.values()]
            .sort((order1, order2) => order2.number.price - order1.number.price);
        assert_1.default(this.checksum(sortedAsks, sortedBids, expected));
        return {
            asks: sortedAsks.map(orderBoth => orderBoth.number),
            bids: sortedBids.map(orderBoth => orderBoth.number),
        };
    }
    checksum(sortedAsks, sortedBids, expected) {
        return official_v3_websocket_client_modified_1.default.checksum({
            data: [{
                    asks: sortedAsks.map(orderBoth => [
                        orderBoth.string.price,
                        orderBoth.string.amount,
                    ]),
                    bids: sortedBids.map(orderBoth => [
                        orderBoth.string.price,
                        orderBoth.string.amount,
                    ]),
                    checksum: expected,
                }]
        });
    }
}
exports.default = Incremental;
//# sourceMappingURL=incremental.js.map