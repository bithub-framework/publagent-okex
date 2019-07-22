/**
 * 设单位时间内 k 次 update，orderbook 平均 size 为 n
 * 平衡树 O(klogn + kn) = O(kn)
 * 哈希 O(k+ knlogn) = O(knlogn)
 * 因为 n 很小，所以直接哈希。
 */
import { Orderbook, Order } from 'interfaces';
interface OrderWithID {
    order: Order;
    id: string;
}
declare class Incremental {
    private map;
    constructor();
    update({ order, id }: OrderWithID): void;
    readonly latest: Orderbook;
}
export default Incremental;
export { OrderWithID, };
