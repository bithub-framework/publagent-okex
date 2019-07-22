"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const autobind_decorator_1 = require("autobind-decorator");
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
        this.started = (() => __awaiter(this, void 0, void 0, function* () {
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
            this.subscriberTrade.on(subscriber_trade_1.default.States.DESTRUCTING.toString(), this.stop);
            this.subscriberDepth = new subscriber_depth_1.default(this.okex);
            this.subscriberDepth.on('data', lodash_1.flow((orderbook) => ({
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                orderbook,
            }), JSON.stringify, this.center.send.bind(this.center)));
            this.subscriberDepth.on('error', logger_1.default.error);
            this.subscriberDepth.on(subscriber_depth_1.default.States.DESTRUCTING.toString(), this.stop);
            this.state = States.RUNNING;
        }))().catch(err => {
            this.stop();
            throw err;
        });
        return this.started;
    }
    stop(err) {
        if (this.state === States.STOPPING)
            return this.stopped;
        if (this.state === States.STARTING)
            return this.started
                .then(() => void this.stop())
                .catch(() => void this.stop());
        this.state = States.STOPPING;
        this.stopped = (() => __awaiter(this, void 0, void 0, function* () {
            this.stopping(err);
            this.okex.close();
            this.center.close();
            this.state = States.READY;
        }))();
        return this.stopped;
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
__decorate([
    autobind_decorator_1.boundMethod
], QAOW.prototype, "stop", null);
exports.default = QAOW;
//# sourceMappingURL=index.js.map