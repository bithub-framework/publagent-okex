"use strict";
/**
 * 跟 subscriber-depth 差不多
 * 不处理 error 响应，也不处理 okex 关闭，留给 index 统一处理。
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const lodash_1 = require("lodash");
const format_1 = require("./format");
class SubscriberTrades extends events_1.default {
    constructor(okex) {
        super();
        this.okex = okex;
        this.onTradesData = (raw) => {
            if (raw.table !== 'spot/trade')
                return;
            return lodash_1.flow(format_1.formatRawTrades, trades => void this.emit('data', trades))(raw.data);
        };
        this.okex.on('rawData', this.onTradesData);
        this.subscribe();
    }
    subscribe() {
        this.okex.subscribe('spot/trade:BTC-USDT');
        this.onTradesSub = raw => {
            if (raw.channel !== 'spot/trade:BTC-USDT')
                return;
            this.okex.off('rawData', this.onTradesSub);
            if (raw.event === 'subscribe')
                this.emit('subscribed');
        };
        this.okex.on('rawData', this.onTradesSub);
    }
}
exports.default = SubscriberTrades;
//# sourceMappingURL=subscriber-trades.js.map