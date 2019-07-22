"use strict";
/**
 * 设单位时间内 k 次 update，orderbook 平均 size 为 n
 * 平衡树 O(klogn + kn) = O(kn)
 * 哈希 O(k+ knlogn) = O(knlogn)
 * 因为 n 很小，所以直接哈希。
 */
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("interfaces");
const mathjs_1 = require("mathjs");
;
class Incremental {
    constructor() {
        this.bids = new Map();
        this.asks = new Map();
    }
    update({ order, raw: { 0: rawPrice } }) {
        if (order.action === interfaces_1.Action.BID)
            if (mathjs_1.equal(order.amount, 0))
                this.bids.delete(rawPrice);
            else
                this.bids.set(rawPrice, order);
        else if (mathjs_1.equal(order.amount, 0))
            this.asks.delete(rawPrice);
        else
            this.asks.set(rawPrice, order);
    }
    clear() {
        this.bids.clear();
        this.asks.clear();
    }
    get latest() {
        return {
            bids: [...this.bids.values()].sort(({ price: price1 }, { price: price2 }) => -mathjs_1.compare(price1, price2)),
            asks: [...this.asks.values()].sort(({ price: price1 }, { price: price2 }) => mathjs_1.compare(price1, price2)),
        };
    }
}
exports.default = Incremental;
//# sourceMappingURL=incremental.js.map