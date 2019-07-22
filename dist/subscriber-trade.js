"use strict";
/**
 * 跟 subscriber-depth 差不多
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const lodash_1 = require("lodash");
const format_1 = require("./format");
var States;
(function (States) {
    States[States["SUBSCRIBING"] = 0] = "SUBSCRIBING";
    States[States["SUBSCRIBED"] = 1] = "SUBSCRIBED";
    States[States["UNSUBSCRIBING"] = 2] = "UNSUBSCRIBING";
    States[States["UNSUBSCRIBED"] = 3] = "UNSUBSCRIBED";
    States["DESTRUCTING"] = "destructing";
})(States || (States = {}));
class SubscriberTrade extends events_1.default {
    constructor(okex) {
        super();
        this.okex = okex;
        this.state = States.UNSUBSCRIBED;
        this.onOkexClose = () => {
            this.destructor();
        };
        this.onData = (raw) => {
            if (raw.table !== 'spot/trade')
                return;
            return lodash_1.flow(format_1.formatTrades, trades => void this.emit('data', trades))(raw.data);
        };
        this.okex.on('data', this.onData);
        this.okex.on('close', this.onOkexClose);
        this.subscribe()
            .catch(err => {
            this.emit('error', err);
            this.destructor();
        });
    }
    destructor() {
        if (this.state === States.DESTRUCTING)
            return;
        this.okex.off('data', this.onData);
        this.okex.off('close', this.onOkexClose);
        this.onTradeSub && this.okex.off('data', this.onTradeSub);
        this.onTradeUnsub && this.okex.off('data', this.onTradeUnsub);
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            this.state = States.SUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.subscribe('spot/trade:BTC-USDT');
            this.onTradeSub = (data) => {
                if (data.channel !== 'spot/trade:BTC-USDT')
                    return;
                if (data.event === 'subscribe') {
                    this.okex.off('data', this.onTradeSub);
                    this.state = States.SUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                }
                else if (data.event === 'error') {
                    reject(new Error(data.message));
                }
                else
                    reject(data);
            };
            this.okex.on('data', this.onTradeSub);
        });
    }
    unsubscribe() {
        return new Promise((resolve, reject) => {
            this.state = States.UNSUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.unsubscribe('spot/trade:BTC-USDT');
            this.onTradeUnsub = (data) => {
                if (data.channel !== 'spot/trade:BTC-USDT')
                    return;
                if (data.event === 'unsubscribe') {
                    this.okex.off('data', this.onTradeUnsub);
                    this.state = States.UNSUBSCRIBED;
                    this.emit(this.state.toString());
                    resolve();
                }
                else if (data.event === 'error') {
                    reject(new Error(data.message));
                }
                else
                    reject(data);
            };
            this.okex.on('data', this.onTradeUnsub);
        });
    }
}
SubscriberTrade.States = States;
exports.default = SubscriberTrade;
//# sourceMappingURL=subscriber-trade.js.map