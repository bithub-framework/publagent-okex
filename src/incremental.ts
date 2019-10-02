/**
 * 设单位时间内 k 次 update，p 次 latest 或 checksum
 * orderbook 平均 size 为 n
 * 平衡树 O(klogn + pn)
 * 哈希 O(k + pnlogn)
 * 因为 n 很小，所以直接哈希。
 */

import { Orderbook, Order, Action } from 'interfaces';
import { OrderString } from './interfaces';
import { flow as pipe } from 'lodash';
import V3WebsocketClient from './official-v3-websocket-client';
import assert from 'assert';

type OrderNumber = Order;

interface OrderBoth {
    number: OrderNumber,
    string: OrderString,
}

class Incremental {
    private asks = new Map<string, OrderBoth>();
    private bids = new Map<string, OrderBoth>();

    update(orderString: OrderString) {
        const orderNumber = this.formatOrderStringToOrder(orderString);
        const orderBoth: OrderBoth = {
            string: orderString,
            number: orderNumber,
        };

        if (orderString.action === Action.ASK)
            if (orderString.amount === '0')
                this.asks.delete(orderString.price);
            else this.asks.set(orderString.price, orderBoth);
        else
            if (orderString.amount === '0')
                this.bids.delete(orderString.price);
            else this.bids.set(orderString.price, orderBoth);
    }

    clear(): void {
        this.asks.clear();
        this.bids.clear();
    }

    private formatOrderStringToOrder(order: OrderString): Order {
        return {
            action: order.action,
            price: pipe(
                Number.parseFloat,
                x => x * 100,
                Math.round,
            )(order.price),
            amount: Number.parseFloat(order.amount),
        };
    }

    getLatest(expected: number): Orderbook {
        const sortedAsks = [...this.asks.values()]
            .sort((order1, order2) =>
                order1.number.price - order2.number.price);
        const sortedBids = [...this.bids.values()]
            .sort((order1, order2) =>
                order2.number.price - order1.number.price);

        assert(this.checksum(
            sortedAsks,
            sortedBids,
            expected,
        ));

        return {
            asks: sortedAsks.map(orderBoth => orderBoth.number),
            bids: sortedBids.map(orderBoth => orderBoth.number),
        }
    }

    private checksum(
        sortedAsks: OrderBoth[],
        sortedBids: OrderBoth[],
        expected: number,
    ): boolean {
        return V3WebsocketClient.checksum({
            data: [{
                asks: sortedAsks.map(orderBoth => [
                    orderBoth.string.price,
                    orderBoth.string.amount,
                ]),
                bids: sortedBids.map(orderBoth => [
                    orderBoth.string.price,
                    orderBoth.string.amount,
                ]),
                checksum: expected,
            }]
        });
    }
}

export default Incremental;