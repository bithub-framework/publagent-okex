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
    private formatStringOrderToOrder;
    getLatest(expected: number): Orderbook;
    private checksum;
}
export { Incremental as default, Incremental, };
