/**
 * 设单位时间内 k 次 update，orderbook 平均 size 为 n
 * 平衡树 O(klogn + kn) = O(kn)
 * 哈希 O(k+ knlogn) = O(knlogn)
 * 因为 n 很小，所以直接哈希。
 */

import { Orderbook, Order, Action } from 'interfaces';
import { equal, compare } from 'mathjs';

interface OrderAndRaw {
    order: Order,
    raw: [string, string],
};

class Incremental {
    private bids = new Map<string, Order>();
    private asks = new Map<string, Order>();

    constructor() { }

    update({ order, raw: { 0: rawPrice } }: OrderAndRaw): void {
        if (order.action === Action.BID)
            if (equal(order.amount, 0))
                this.bids.delete(rawPrice);
            else this.bids.set(rawPrice, order);
        else
            if (equal(order.amount, 0))
                this.asks.delete(rawPrice);
            else this.asks.set(rawPrice, order);
    }

    clear(): void {
        this.bids.clear();
        this.asks.clear();
    }

    get latest(): Orderbook {
        return {
            bids: [...this.bids.values()].sort(
                ({ price: price1 }, { price: price2 }) =>
                    -<number>compare(price1, price2)),
            asks: [...this.asks.values()].sort(
                ({ price: price1 }, { price: price2 }) =>
                    <number>compare(price1, price2)),
        }
    }
}

export default Incremental;
export {
    OrderAndRaw,
};