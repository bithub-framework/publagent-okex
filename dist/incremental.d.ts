import { Orderbook, Order } from 'interfaces';
import { StringOrder } from './interfaces';
import { Pair } from './market-descriptions';
declare type NumberOrder = Order;
declare function formatStringOrderToOrder(pair: Pair, order: StringOrder): NumberOrder;
declare class Incremental {
    private pair;
    private asks;
    private bids;
    private time;
    constructor(pair: Pair);
    update(stringOrder: StringOrder, timeStamp: string): void;
    getLatest(expected: number): Orderbook;
    private checksum;
}
export { Incremental as default, Incremental, formatStringOrderToOrder, };
