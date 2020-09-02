/*
    设单位时间内 k 次 update，分成 r (1 <= r <= k) 条消息来，p 次 getLatest/checksum
    orderbook 平均 size 为 n
    平衡树 O(klogn + pn)
    哈希 O(k + pnlogn)
    线性扫一遍 O(rn+k + pn) 最坏情况 r = k 每次来消息只更新一个 O(kn + pn)
    因为 n 很小，所以 logn 近似为常数，平衡树和哈希时间复杂度相同
    所以直接哈希。
 */
import _ from 'lodash';
import checksum from './checksum';
import assert from 'assert';
import { marketDescriptors, } from './market-descriptions';
const { flow: pipe } = _;
function formatStringOrderToOrder(pair, order) {
    const numberOrder = {
        action: order.action === 'ask' ? "ask" /* ASK */ : "bid" /* BID */,
        price: pipe(Number.parseFloat, x => x * 100, Math.round)(order.price),
        amount: Number.parseFloat(order.amount),
    };
    numberOrder.amount = marketDescriptors[pair].normalizeAmount(numberOrder.price, numberOrder.amount);
    return numberOrder;
}
class Incremental {
    constructor(pair) {
        this.pair = pair;
        this.asks = new Map();
        this.bids = new Map();
        this.time = Number.NEGATIVE_INFINITY;
    }
    update(stringOrder, timeStamp) {
        this.time = Date.parse(timeStamp);
        if (stringOrder.action === "ask" /* ASK */)
            if (stringOrder.amount === '0')
                this.asks.delete(stringOrder.price);
            else
                this.asks.set(stringOrder.price, stringOrder);
        else if (stringOrder.amount === '0')
            this.bids.delete(stringOrder.price);
        else
            this.bids.set(stringOrder.price, stringOrder);
    }
    getLatest(expected) {
        const sortedAsks = [...this.asks.values()]
            .map(stringOrder => ({
            stringOrder,
            numberOrder: formatStringOrderToOrder(this.pair, stringOrder),
        })).sort((order1, order2) => order1.numberOrder.price - order2.numberOrder.price);
        const sortedBids = [...this.bids.values()]
            .map(stringOrder => ({
            stringOrder,
            numberOrder: formatStringOrderToOrder(this.pair, stringOrder),
        })).sort((order1, order2) => order2.numberOrder.price - order1.numberOrder.price);
        assert(this.checksum(sortedAsks, sortedBids, expected));
        return {
            asks: sortedAsks.map(numberStringOrder => numberStringOrder.numberOrder),
            bids: sortedBids.map(numberStringOrder => numberStringOrder.numberOrder),
            time: this.time,
        };
    }
    checksum(sortedAsks, sortedBids, expected) {
        return checksum({
            data: [{
                    asks: sortedAsks.map(numberStringOrder => [
                        numberStringOrder.stringOrder.price,
                        numberStringOrder.stringOrder.amount,
                    ]),
                    bids: sortedBids.map(numberStringOrder => [
                        numberStringOrder.stringOrder.price,
                        numberStringOrder.stringOrder.amount,
                    ]),
                    checksum: expected,
                }]
        });
    }
}
export { Incremental as default, Incremental, formatStringOrderToOrder, };
//# sourceMappingURL=incremental.js.map