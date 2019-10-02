"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const incremental_1 = __importDefault(require("./incremental"));
const format_1 = require("./format");
class SubscriberOrderbook extends events_1.default {
    constructor(okex) {
        super();
        this.okex = okex;
        this.incremental = new incremental_1.default();
        this.onOrderbookData = (raw) => {
            if (raw.table !== 'spot/depth')
                return;
            const ordersString = format_1.formatRawOrderbookToOrdersString(raw.data[0]);
            ordersString.forEach(orderString => void this.incremental.update(orderString));
            try {
                const orderbook = this.incremental.getLatest(raw.data[0].checksum);
                this.emit('data', orderbook);
            }
            catch (err) {
                this.emit('error', err);
            }
        };
        this.okex.on('rawData', this.onOrderbookData);
        this.subscribe();
    }
    subscribe() {
        this.okex.subscribe('spot/depth:BTC-USDT');
        this.onOrderbookSub = raw => {
            if (raw.channel !== 'spot/depth:BTC-USDT')
                return;
            this.okex.off('rawData', this.onOrderbookSub);
            if (raw.event === 'subscribe')
                this.emit('subscribed');
        };
        this.okex.on('rawData', this.onOrderbookSub);
    }
}
exports.default = SubscriberOrderbook;
//# sourceMappingURL=subscriber-orderbook.js.map