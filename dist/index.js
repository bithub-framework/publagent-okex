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
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const autonomous_1 = __importDefault(require("autonomous"));
const events_1 = require("events");
const autobind_decorator_1 = require("autobind-decorator");
const official_v3_websocket_client_1 = __importDefault(require("./official-v3-websocket-client"));
const raw_orderbook_handler_1 = __importDefault(require("./raw-orderbook-handler"));
const raw_trades_handler_1 = require("./raw-trades-handler");
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../cfg/config.json'));
const ACTIVE_CLOSE = 4000;
class QuoteAgentOkexWebsocket extends autonomous_1.default {
    constructor() {
        super(...arguments);
        this.rawOrderbookHandler = new raw_orderbook_handler_1.default();
    }
    _start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectOkex();
            yield this.connectQuoteCenter();
            this.okex.on('rawData', this.onRawData);
            yield this.subscribeTrades();
            yield this.subscribeOrderbook();
        });
    }
    _stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.okex)
                this.okex.close();
            if (this.center && this.center.readyState !== 3) {
                this.center.close(ACTIVE_CLOSE);
                yield events_1.once(this.center, 'close');
            }
        });
    }
    connectQuoteCenter() {
        return __awaiter(this, void 0, void 0, function* () {
            this.center = new ws_1.default(`ws://localhost:${config.QUOTE_CENTER_PORT}/okex/btc.usdt`);
            this.center.on('close', code => {
                if (code !== ACTIVE_CLOSE)
                    this.center.emit('error', new Error('quote center closed'));
            });
            this.center.on('error', (err) => {
                console.error(err);
                this.stop();
            });
            yield events_1.once(this.center, 'open');
        });
    }
    connectOkex() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex = new official_v3_websocket_client_1.default(config.OKEX_URL);
            this.okex.on('message', (msg) => void this.okex.emit('rawData', JSON.parse(msg)));
            this.okex.on('rawData', (raw) => {
                if (raw.event === 'error')
                    this.okex.emit('error', new Error(raw.message));
            });
            this.okex.on('close', () => {
                this.okex.emit('error', new Error('okex closed'));
            });
            this.okex.on('error', (err) => {
                console.error(err);
                this.stop();
            });
            this.okex.connect();
            yield events_1.once(this.okex, 'open');
        });
    }
    onRawData(raw) {
        if (raw.table === 'spot/trade')
            this.onRawTrades(raw);
        if (raw.table === 'spot/depth')
            this.onRawOrderbook(raw);
    }
    onRawTrades(rawTrades) {
        const trades = raw_trades_handler_1.formatRawTrades(rawTrades);
        const sentData = { trades };
        this.center.send(JSON.stringify(sentData));
    }
    onRawOrderbook(rawOrderbook) {
        const orderbook = this.rawOrderbookHandler.handle(rawOrderbook);
        const sentData = { orderbook };
        this.center.send(JSON.stringify(sentData));
    }
    subscribeTrades() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex.subscribe('spot/trade:BTC-USDT');
            const onTradesSub = (raw) => {
                if (raw.channel === 'spot/trade:BTC-USDT'
                    && raw.event === 'subscribe')
                    this.okex.emit('trades subscribed');
            };
            this.okex.on('rawData', onTradesSub);
            yield events_1.once(this.okex, 'trades subscribed');
            this.okex.off('rawData', onTradesSub);
        });
    }
    subscribeOrderbook() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex.subscribe('spot/depth:BTC-USDT');
            const onOrderbookSub = (raw) => {
                if (raw.channel === 'spot/depth:BTC-USDT'
                    && raw.event === 'subscribe')
                    this.okex.emit('orderbook subscribed');
            };
            this.okex.on('rawData', onOrderbookSub);
            yield events_1.once(this.okex, 'orderbook subscribed');
            this.okex.off('rawData', onOrderbookSub);
        });
    }
}
__decorate([
    autobind_decorator_1.boundMethod
], QuoteAgentOkexWebsocket.prototype, "onRawData", null);
exports.default = QuoteAgentOkexWebsocket;
//# sourceMappingURL=index.js.map