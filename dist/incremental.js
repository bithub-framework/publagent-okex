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
        this.map = {
            bids: new Map(),
            asks: new Map(),
        };
    }
    update({ order, id }) {
        if (order.action === interfaces_1.Action.BID)
            if (mathjs_1.equal(order.amount, 0))
                this.map.bids.delete(id);
            else
                this.map.bids.set(id, order);
        else if (mathjs_1.equal(order.amount, 0))
            this.map.asks.delete(id);
        else
            this.map.asks.set(id, order);
    }
    get latest() {
        return {
            bids: [...this.map.bids.values()].sort(({ price: price1 }, { price: price2 }) => -mathjs_1.compare(price1, price2)),
            asks: [...this.map.asks.values()].sort(({ price: price1 }, { price: price2 }) => mathjs_1.compare(price1, price2)),
        };
    }
}
exports.default = Incremental;
//# sourceMappingURL=incremental.js.map