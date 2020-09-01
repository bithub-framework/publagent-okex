/**
 * 设单位时间内 k 次 update，分成 r (1 <= r <= k) 条消息来，p 次 getLatest/checksum
 * orderbook 平均 size 为 n
 * 平衡树 O(klogn + pn)
 * 哈希 O(k + pnlogn)
 * 线性扫一遍 O(rn+k + pn) 最坏情况 r = k 每次来消息只更新一个 O(kn + pn)
 * 因为 n 很小，所以 logn 近似为常数，平衡树和哈希时间复杂度相同
 * 所以直接哈希。
 */
import { Orderbook } from 'interfaces';
import { StringOrder } from './interfaces';
import { Pair } from './market-descriptions';
declare class Incremental {
    private pair;
    private asks;
    private bids;
    private time;
    constructor(pair: Pair);
    update(stringOrder: StringOrder, timeStamp: string): void;
    clear(): void;
    private formatStringOrderToOrder;
    getLatest(expected: number): Orderbook;
    private checksum;
}
export default Incremental;
export { Incremental };
