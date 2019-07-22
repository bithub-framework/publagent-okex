"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const events_1 = __importDefault(require("events"));
const incremental_1 = __importDefault(require("./incremental"));
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
;
class SubscriberDepth extends events_1.default {
    constructor(okex) {
        super();
        this.okex = okex;
        this.state = States.UNSUBSCRIBED;
        this.incremental = new incremental_1.default();
        this.onOkexClose = () => {
            this.destructor();
        };
        this.onChecksumError = () => {
            return bluebird_1.default.try(() => __awaiter(this, void 0, void 0, function* () {
                this.incremental.clear();
                yield this.unsubscribe();
                yield this.subscribe();
            })).catch(err => {
                this.emit('error', err);
                this.destructor();
            });
        };
        this.onData = (raw) => {
            if (raw.table !== 'spot/depth')
                return;
            return lodash_1.flow(format_1.formatOrderbook, this.updateOrders, orderbook => void this.emit('data', orderbook))(raw.data);
        };
        this.updateOrders = (orders) => {
            orders.forEach(order => void this.incremental.update(order));
            return this.incremental.latest;
        };
        this.okex.on('close', this.onOkexClose);
        this.okex.on('data', this.onData);
        this.on('checksum error', this.onChecksumError);
        this.subscribe()
            .catch(err => {
            this.emit('error', err);
            this.destructor();
        });
    }
    destructor() {
        if (this.state === States.DESTRUCTING)
            return;
        this.state = States.DESTRUCTING;
        this.emit(this.state.toString());
        this.okex.off('close', this.onOkexClose);
        this.off('checksum error', this.onChecksumError);
        this.okex.off('data', this.onData);
        this.onDepthSub && this.okex.off('data', this.onDepthSub);
        this.onDepthUnsub && this.okex.off('data', this.onDepthUnsub);
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            this.state = States.SUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.subscribe('spot/depth:BTC-USDT');
            this.onDepthSub = (data) => {
                if (data.channel !== 'spot/deoth:BTC-USDT')
                    return;
                if (data.event === 'subscribe') {
                    this.okex.off('data', this.onDepthSub);
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
            this.okex.on('data', this.onDepthSub);
        });
    }
    unsubscribe() {
        return new Promise((resolve, reject) => {
            this.state = States.UNSUBSCRIBING;
            this.emit(this.state.toString());
            this.okex.unsubscribe('spot/depth:BTC-USDT');
            this.onDepthUnsub = (data) => {
                if (data.channel !== 'spot/depth:BTC-USDT')
                    return;
                if (data.event === 'unsubscribe') {
                    this.okex.off('data', this.onDepthUnsub);
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
            this.okex.on('data', this.onDepthUnsub);
        });
    }
}
SubscriberDepth.States = States;
exports.default = SubscriberDepth;
//# sourceMappingURL=subscriber-depth.js.map