"use strict";
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
const okex_node_1 = require("@okfe/okex-node");
const first_event_1 = __importDefault(require("first-event"));
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
const incremental_1 = __importDefault(require("./incremental"));
const format_1 = require("./format");
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../cfg/config.json'));
var States;
(function (States) {
    States[States["READY"] = 0] = "READY";
    States[States["STARTING"] = 1] = "STARTING";
    States[States["RUNNING"] = 2] = "RUNNING";
    States[States["STOPPING"] = 3] = "STOPPING";
})(States || (States = {}));
;
class QAOW {
    constructor(stopping = () => { }) {
        this.stopping = stopping;
        this.state = States.READY;
        this.onMessage = lodash_1.flow(JSON.parse, this.normalize.bind(this), JSON.stringify, this.center.send.bind(this.center));
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            assert_1.default(this.state === States.READY);
            this.state = States.STARTING;
            this.okex = new okex_node_1.V3WebsocketClient();
            this.incremental = new incremental_1.default();
            yield this.connectOkex();
            yield this.connectQuoteCenter();
            this.okex.subscribe('spot/depth:BTC-USDT');
            yield this.subscribeTrade();
            yield this.subscribeDepth();
            this.okex.on('message', this.onMessage);
            this.state = States.RUNNING;
        });
    }
    stop(err) {
        assert_1.default(this.state === States.RUNNING);
        this.stopping(err);
        this.okex.close();
        this.center.close();
        this.state = States.READY;
    }
    subscribeTrade() {
        return new Promise((resolve, reject) => {
            this.okex.subscribe('spot/trade:BTC-USDT');
            const onTradeSub = (msg) => {
                const data = JSON.parse(msg);
                if (data.channel !== 'spot/trade:BTC-USDT')
                    return;
                if (data.event === 'subscribe') {
                    this.okex.off('message', onTradeSub);
                    resolve();
                }
                else if (data.event === 'error') {
                    reject(new Error(data.message));
                }
                else
                    reject(data);
            };
            this.okex.on('message', onTradeSub);
        });
    }
    subscribeDepth() {
        return new Promise((resolve, reject) => {
            this.okex.subscribe('spot/depth:BTC-USDT');
            const onDepthSub = (msg) => {
                const data = JSON.parse(msg);
                if (data.channel !== 'spot/depth:BTC-USDT')
                    return;
                if (data.event === 'subscribe') {
                    this.okex.off('message', onDepthSub);
                    resolve();
                }
                else if (data.event === 'error') {
                    reject(new Error(data.message));
                }
                else
                    reject(data);
            };
            this.okex.on('message', onDepthSub);
        });
    }
    connectQuoteCenter() {
        return __awaiter(this, void 0, void 0, function* () {
            this.center = new ws_1.default(`ws://localhost:${config.QUOTE_CENTER_PORT}`);
            yield first_event_1.default([{
                    emitter: this.center, event: 'open',
                }, {
                    emitter: this.center, event: 'error',
                }]).then(({ event, args }) => {
                if (event === 'error')
                    throw args[0];
            });
        });
    }
    connectOkex() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex.connect();
            yield first_event_1.default([{
                    emitter: this.okex, event: 'open',
                }, {
                    emitter: this.okex, event: 'error',
                }]).then(({ event, args }) => {
                if (event === 'error')
                    throw args[0];
            });
        });
    }
    normalize(raw) {
        switch (raw.table) {
            case 'spot/trade':
                return {
                    exchange: 'okex',
                    pair: ['btc', 'usdt'],
                    trades: format_1.formatTrades(raw.data),
                };
            case 'spot/depth':
                return {
                    exchange: 'okex',
                    pair: ['btc', 'usdt'],
                    orderbook: lodash_1.flow(format_1.formatOrderbook, this.updateOrders.bind(this))(raw.data),
                };
            default: throw new Error();
        }
    }
    updateOrders(orders) {
        orders.forEach(order => void this.incremental.update(order));
        return this.incremental.latest;
    }
}
exports.default = QAOW;
//# sourceMappingURL=index.js.map