/**
 * 语义上，订阅与取关属于运行过程的一部分，而不属于构造析构过程。
 * 所以订阅与取关时发生的错误，不属于构造析构异常。
 * 
 * 这是一个自治对象，以下情况会使它自动析构
 * 
 * - 订阅与取关时发生错误。
 * - okex 关闭。
 * 
 * 析构之后，订阅状态是不确定的。
 * 
 * 有以下事件
 * 
 * - destructing
 * - 5 个状态
 * - data
 * - error
 * - checksum error
 */

import Bluebird from 'bluebird';
import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
import Incremental from './incremental';
import { OrderAndRaw } from './incremental';
import { flow as pipe } from 'lodash';
import { formatOrderbook } from './format';
import { Orderbook } from 'interfaces';

enum States {
    SUBSCRIBING,
    SUBSCRIBED,
    UNSUBSCRIBING,
    UNSUBSCRIBED,
    DESTRUCTING = 'destructing',
};

class SubscriberDepth extends EventEmitter {
    static States = States;
    private state = States.UNSUBSCRIBED;
    private incremental = new Incremental();

    constructor(private okex: V3WebsocketClient) {
        super();

        this.okex.on('close', this.onOkexClose);
        this.okex.on('data', this.onData);

        this.on('checksum error', this.onChecksumError);

        this.subscribe()
            .catch(err => {
                this.emit('error', err);
                this.destructor();
            });
    }

    private destructor(): void {
        if (this.state === States.DESTRUCTING) return;
        this.state = States.DESTRUCTING;
        this.emit(this.state.toString());

        this.okex.off('close', this.onOkexClose);
        this.off('checksum error', this.onChecksumError);
        this.okex.off('data', this.onData);
        this.onDepthSub && this.okex.off('data', this.onDepthSub);
        this.onDepthUnsub && this.okex.off('data', this.onDepthUnsub);
    }

    private onOkexClose = (): void => {
        this.destructor();
    }

    private onChecksumError = (): Promise<void> => {
        return Bluebird.try(async () => {
            this.incremental.clear();
            await this.unsubscribe();
            await this.subscribe();
        }).catch(err => {
            this.emit('error', err);
            this.destructor();
        });
    }

    private onDepthSub: ((data: any) => void) | undefined;
    private subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.state = States.SUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.subscribe('spot/depth:BTC-USDT');
            this.onDepthSub = (data: any): void => {
                if (data.channel !== 'spot/deoth:BTC-USDT') return;
                if (data.event === 'subscribe') {
                    this.okex.off('data', this.onDepthSub!);
                    this.state = States.SUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                } else if (data.event === 'error') {
                    reject(new Error(data.message));
                } else reject(data);
            }
            this.okex.on('data', this.onDepthSub);
        });
    }

    private onDepthUnsub: ((data: any) => void) | undefined;
    private unsubscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.state = States.UNSUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.unsubscribe('spot/depth:BTC-USDT');
            this.onDepthUnsub = (data: any): void => {
                if (data.channel !== 'spot/depth:BTC-USDT') return;
                if (data.event === 'unsubscribe') {
                    this.okex.off('data', this.onDepthUnsub!);
                    this.state = States.UNSUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                } else if (data.event === 'error') {
                    reject(new Error(data.message));
                } else reject(data);
            }
            this.okex.on('data', this.onDepthUnsub);
        });
    }

    private onData = (raw: any): void => {
        if (raw.table !== 'spot/depth') return;
        return pipe(
            formatOrderbook,
            this.updateOrders,
            orderbook => void this.emit('data', orderbook),
        )(raw.data);
    }

    private updateOrders = (orders: OrderAndRaw[]): Orderbook => {
        orders.forEach(order => void this.incremental!.update(order));
        return this.incremental!.latest;
    }
}

export default SubscriberDepth;