/**
 * 设单位时间内 k 次 update，p 次 latest 或 checksum
 * orderbook 平均 size 为 n
 * 平衡树 O(klogn + pn)
 * 哈希 O(k + pnlogn)
 * 因为 n 很小，所以直接哈希。
 */
import { Orderbook } from 'interfaces';
import { OrderString } from './interfaces';
declare class Incremental {
    private isPerpetual;
    private asks;
    private bids;
    constructor(isPerpetual: boolean);
    update(orderString: OrderString): void;
    clear(): void;
    private formatOrderStringToOrder;
    getLatest(expected: number): Orderbook;
    private checksum;
}
export default Incremental;
export { Incremental };
