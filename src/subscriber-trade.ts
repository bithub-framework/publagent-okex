/**
 * 跟 subscriber-depth 差不多
 */

import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
import { flow as pipe } from 'lodash';
import { formatTrades } from './format';

enum States {
    SUBSCRIBING,
    SUBSCRIBED,
    UNSUBSCRIBING,
    UNSUBSCRIBED,
    DESTRUCTING = 'destructing',
}

class SubscriberTrade extends EventEmitter {
    static States = States;
    private state = States.UNSUBSCRIBED;

    constructor(private okex: V3WebsocketClient) {
        super();

        this.okex.on('data', this.onData);
        this.okex.on('close', this.onOkexClose);

        this.subscribe()
            .catch(err => {
                this.emit('error', err);
                this.destructor();
            });
    }

    private onOkexClose = (): void => {
        this.destructor();
    }

    destructor(): void {
        if (this.state === States.DESTRUCTING) return;
        this.okex.off('data', this.onData);
        this.okex.off('close', this.onOkexClose);
        this.onTradeSub && this.okex.off('data', this.onTradeSub);
        this.onTradeUnsub && this.okex.off('data', this.onTradeUnsub);
    }

    private onTradeSub: ((data: any) => void) | undefined;
    subscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.state = States.SUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.subscribe('spot/trade:BTC-USDT');
            this.onTradeSub = (data: any): void => {
                if (data.channel !== 'spot/trade:BTC-USDT') return;
                if (data.event === 'subscribe') {
                    this.okex.off('data', this.onTradeSub!);
                    this.state = States.SUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                } else if (data.event === 'error') {
                    reject(new Error(data.message));
                } else reject(data);
            }
            this.okex.on('data', this.onTradeSub);
        });
    }

    private onTradeUnsub: ((data: any) => void) | undefined;
    unsubscribe(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.state = States.UNSUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.unsubscribe('spot/trade:BTC-USDT');
            this.onTradeUnsub = (data: any): void => {
                if (data.channel !== 'spot/trade:BTC-USDT') return;
                if (data.event === 'unsubscribe') {
                    this.okex.off('data', this.onTradeUnsub!);
                    this.state = States.UNSUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                } else if (data.event === 'error') {
                    reject(new Error(data.message));
                } else reject(data);
            }
            this.okex.on('data', this.onTradeUnsub);
        });
    }

    private onData = (raw: any): void => {
        if (raw.table !== 'spot/trade') return;
        return pipe(
            formatTrades,
            trades => void this.emit('data', trades),
        )(raw.data);
    }
}

export default SubscriberTrade;