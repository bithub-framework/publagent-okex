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
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const subscriber_trade_1 = __importDefault(require("./subscriber-trade"));
const subscriber_orderbook_1 = __importDefault(require("./subscriber-orderbook"));
const console_1 = __importDefault(require("console"));
const autonomous_1 = __importDefault(require("autonomous"));
const events_1 = __importDefault(require("events"));
const process_1 = __importDefault(require("process"));
const DEBUG = process_1.default.env.NODE_ENV !== 'production';
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../cfg/config.json'));
class QuoteAgentOkexWebsocket extends autonomous_1.default {
    _start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectOkex();
            yield this.connectQuoteCenter();
            this.subscribeTrade();
            this.subscribeOrderbook();
        });
    }
    _stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.okex)
                this.okex.close();
            if (this.center)
                this.center.close();
        });
    }
    connectQuoteCenter() {
        return __awaiter(this, void 0, void 0, function* () {
            this.center = new ws_1.default(`ws://localhost:${config.QUOTE_CENTER_PORT}`);
            yield events_1.default.once(this.center, 'open');
            if (DEBUG)
                console_1.default.log('quote center connected');
            this.center.on('error', (err) => {
                console_1.default.error(err);
                this.stop();
            });
        });
    }
    connectOkex() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex = new official_v3_websocket_client_1.default(config.OKEX_URL);
            this.okex.connect();
            // 会自动处理 'error' 事件，详见文档。
            yield events_1.default.once(this.okex, 'open');
            if (DEBUG)
                console_1.default.log('okex connected');
            this.okex.on('message', msg => void this.okex.emit('rawData', JSON.parse(msg)));
            this.okex.on('rawData', (raw) => {
                if (raw.event !== 'error')
                    return;
                console_1.default.error(new Error(raw.message));
                this.stop();
            });
            this.okex.on('error', (err) => {
                console_1.default.error(err);
                this.stop();
            });
        });
    }
    subscribeTrade() {
        this.subscriberTrade = new subscriber_trade_1.default(this.okex);
        this.subscriberTrade.on('data', lodash_1.flow((trades) => ({
            exchange: 'okex',
            pair: ['btc', 'usdt'],
            trades,
        }), JSON.stringify, (data) => this.center.send(data)));
        this.subscriberTrade.on('error', (err) => {
            console_1.default.error(err);
            this.stop();
        });
        if (DEBUG)
            this.subscriberTrade.on('subscribed', () => void console_1.default.log('trade subscribed'));
    }
    subscribeOrderbook() {
        this.subscriberOrderbook = new subscriber_orderbook_1.default(this.okex);
        this.subscriberOrderbook.on('data', lodash_1.flow((orderbook) => ({
            exchange: 'okex',
            pair: ['btc', 'usdt'],
            orderbook,
        }), JSON.stringify, (data) => this.center.send(data)));
        this.subscriberOrderbook.on('error', (err) => {
            console_1.default.error(err);
            this.stop();
        });
        if (DEBUG)
            this.subscriberOrderbook.on('subscribed', () => void console_1.default.log('orderbook subscribed'));
    }
}
exports.default = QuoteAgentOkexWebsocket;
//# sourceMappingURL=index.js.map