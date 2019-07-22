/**
 * 设单位时间内 k 次 update，orderbook 平均 size 为 n
 * 平衡树 O(klogn + kn) = O(kn)
 * 哈希 O(k+ knlogn) = O(knlogn)
 * 因为 n 很小，所以直接哈希。
 */
import { Orderbook, Order } from 'interfaces';
interface OrderAndRaw {
    order: Order;
    raw: [string, string];
}
declare class Incremental {
    private bids;
    private asks;
    constructor();
    update({ order, raw: { 0: rawPrice } }: OrderAndRaw): void;
    clear(): void;
    readonly latest: Orderbook;
}
export default Incremental;
export { OrderAndRaw, };
