import EventEmitter from 'events';
import V3WebsocketClient from './official-v3-websocket-client';
import Incremental from './incremental';
import { formatRawOrderbookToOrdersString } from './format';
import { RawSubSuccData, RawOrderbookData } from './interface';

class SubscriberOrderbook extends EventEmitter {
    private incremental = new Incremental();

    constructor(private okex: V3WebsocketClient) {
        super();
        this.okex.on('rawData', this.onOrderbookData);
        this.subscribe();
    }

    private onOrderbookSub!: (raw: RawSubSuccData) => void;
    private subscribe(): void {
        this.okex.subscribe('spot/depth:BTC-USDT');
        this.onOrderbookSub = raw => {
            if ((<any>raw).channel !== 'spot/deoth:BTC-USDT') return;
            this.okex.off('rawData', this.onOrderbookSub);
            if (raw.event === 'subscribe') this.emit('subscribed');
        }
        this.okex.on('rawData', this.onOrderbookSub);
    }

    private onOrderbookData = (raw: RawOrderbookData): void => {
        if ((<any>raw).table !== 'spot/depth') return;
        const ordersString = formatRawOrderbookToOrdersString(raw.data[0]);
        ordersString.forEach(orderString =>
            void this.incremental.update(orderString));
        try {
            const orderbook = this.incremental.getLatest(
                raw.data[0].checksum);
            this.emit('data', orderbook);
        } catch (err) {
            this.emit('error', err);
        }
    }
}

export default SubscriberOrderbook;