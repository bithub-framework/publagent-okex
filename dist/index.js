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
const official_v3_websocket_client_1 = __importDefault(require("./official-v3-websocket-client"));
const first_event_1 = __importDefault(require("first-event"));
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const bluebird_1 = __importDefault(require("bluebird"));
const assert_1 = __importDefault(require("assert"));
const lodash_1 = require("lodash");
const subscriber_trade_1 = __importDefault(require("./subscriber-trade"));
const subscriber_depth_1 = __importDefault(require("./subscriber-depth"));
const logger_1 = __importDefault(require("./logger"));
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
    }
    start() {
        return bluebird_1.default.try(() => __awaiter(this, void 0, void 0, function* () {
            assert_1.default(this.state === States.READY);
            this.state = States.STARTING;
            yield this.connectOkex();
            yield this.connectQuoteCenter();
            this.okex.on('message', msg => void this.okex.emit('data', JSON.parse(msg)));
            this.subscriberTrade = new subscriber_trade_1.default(this.okex);
            this.subscriberTrade.on('data', lodash_1.flow((trades) => ({
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                trades,
            }), JSON.stringify, this.center.send.bind(this.center)));
            this.subscriberTrade.on('error', logger_1.default.error);
            this.subscriberTrade.on(subscriber_trade_1.default.States.DESTRUCTING.toString(), () => bluebird_1.default
                .try(this.stop.bind(this))
                .catch(() => { }));
            this.subscriberDepth = new subscriber_depth_1.default(this.okex);
            this.subscriberDepth.on('data', lodash_1.flow((orderbook) => ({
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                orderbook,
            }), JSON.stringify, this.center.send.bind(this.center)));
            this.subscriberDepth.on('error', logger_1.default.error);
            this.subscriberDepth.on(subscriber_depth_1.default.States.DESTRUCTING.toString(), () => bluebird_1.default
                .try(() => void this.stop())
                .catch(() => { }));
            this.state = States.RUNNING;
        })).catch(err => {
            this.stop();
            throw err;
        });
    }
    stop(err) {
        if (this.state === States.STOPPING)
            return;
        this.state = States.STOPPING;
        this.stopping(err);
        this.okex.close();
        this.center.close();
        this.state = States.READY;
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
            this.okex = new official_v3_websocket_client_1.default();
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
}
exports.default = QAOW;
//# sourceMappingURL=index.js.map