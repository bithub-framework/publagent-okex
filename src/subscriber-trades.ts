/**
 * 跟 subscriber-depth 差不多
 * 不处理 error 响应，也不处理 okex 关闭，留给 index 统一处理。
 */

import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
import { flow as pipe } from 'lodash';
import { formatRawTrades } from './format';
import { RawTradeData as RawTradesData, RawSubSuccData } from './interfaces';

class SubscriberTrades extends EventEmitter {
    constructor(private okex: V3WebsocketClient) {
        super();

        this.okex.on('rawData', this.onTradesData);

        this.subscribe();
    }

    private onTradesSub!: (raw: RawSubSuccData) => void;
    private subscribe(): void {
        this.okex.subscribe('spot/trade:BTC-USDT');
        this.onTradesSub = raw => {
            if ((<any>raw).channel !== 'spot/trade:BTC-USDT') return;
            this.okex.off('rawData', this.onTradesSub);
            if (raw.event === 'subscribe') this.emit('subscribed');
        }
        this.okex.on('rawData', this.onTradesSub);
    }

    private onTradesData = (raw: RawTradesData): void => {
        if ((<any>raw).table !== 'spot/trade') return;
        return pipe(
            formatRawTrades,
            trades => void this.emit('data', trades),
        )(raw.data);
    }
}

export default SubscriberTrades;