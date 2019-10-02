/**
 * 跟 subscriber-depth 差不多
 * 不处理 error 响应，也不处理 okex 关闭，留给 index 统一处理。
 */

import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
import { flow as pipe } from 'lodash';
import { formatRawTrades } from './format';
import { RawTradeData, RawSubSuccData } from './interface';

class SubscriberTrade extends EventEmitter {
    constructor(private okex: V3WebsocketClient) {
        super();

        this.okex.on('rawData', this.onTradeData);

        this.subscribe();
    }

    private onTradeSub!: (raw: RawSubSuccData) => void;
    private subscribe(): void {
        this.okex.subscribe('spot/trade:BTC-USDT');
        this.onTradeSub = raw => {
            if ((<any>raw).channel !== 'spot/trade:BTC-USDT') return;
            this.okex.off('rawData', this.onTradeSub);
            if (raw.event === 'subscribe') this.emit('subscribed');
        }
        this.okex.on('rawData', this.onTradeSub);
    }

    private onTradeData = (raw: RawTradeData): void => {
        if ((<any>raw).table !== 'spot/trade') return;
        return pipe(
            formatRawTrades,
            trades => void this.emit('data', trades),
        )(raw.data);
    }
}

export default SubscriberTrade;