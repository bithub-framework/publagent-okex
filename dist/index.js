"use strict";
// TODO 把常数放到 config 里
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
const axios_1 = __importDefault(require("axios"));
const autobind_decorator_1 = require("autobind-decorator");
const official_v3_websocket_client_modified_1 = __importDefault(require("./official-v3-websocket-client-modified"));
const raw_orderbook_handler_1 = __importDefault(require("./raw-orderbook-handler"));
const raw_trades_handler_1 = require("./raw-trades-handler");
const mapping_1 = require("./mapping");
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../cfg/config.json'));
const ACTIVE_CLOSE = 4000;
class QuoteAgentOkexWebsocket extends autonomous_1.default {
    constructor() {
        super(...arguments);
        this.center = {};
        this.rawOrderbookHandler = {};
    }
    _start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectOkex();
            yield this.connectQuoteCenter();
            this.okex.on('rawData', this.onRawData);
            yield this.getInstruments();
            yield this.subscribeInstruments();
            yield this.subscribeTrades();
            yield this.subscribeOrderbook();
        });
    }
    _stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.okex)
                this.okex.close();
            for (const pair in mapping_1.marketDescriptors) {
                const center = this.center[pair];
                if (center && center.readyState !== 3) {
                    center.close(ACTIVE_CLOSE);
                    yield events_1.once(center, 'close');
                }
            }
        });
    }
    connectQuoteCenter() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const pair in mapping_1.marketDescriptors) {
                const center = this.center[pair] = new ws_1.default(`${config.QUOTE_CENTER_BASE_URL}/okex/${pair}`);
                center.on('close', code => {
                    if (code !== ACTIVE_CLOSE)
                        center.emit('error', new Error('quote center closed'));
                });
                center.on('error', (err) => {
                    console.error(err);
                    this.stop();
                });
                yield events_1.once(center, 'open');
            }
        });
    }
    connectOkex() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex = new official_v3_websocket_client_modified_1.default(config.OKEX_WEBSOCKET_URL);
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
    getInstruments() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawInstrumentData = yield axios_1.default(`${config.OKEX_RESTFUL_BASE_URL}${config.OKEX_RESTFUL_URL_INSTRUMENTS}`).then(res => res.data);
            this.onRawInstrumentsData(rawInstrumentData);
        });
    }
    onRawData(raw) {
        const { table } = raw;
        if (!table)
            return;
        const channel = mapping_1.getChannel(table);
        if (channel === 'trades') {
            for (const rawTradeData of raw.data) {
                const { instrument_id } = rawTradeData;
                const pair = mapping_1.getPair(table, instrument_id);
                this.onRawTradeData(pair, rawTradeData);
            }
        }
        if (channel === 'orderbook') {
            for (const rawOrderbookData of raw.data) {
                const { instrument_id } = rawOrderbookData;
                const pair = mapping_1.getPair(table, instrument_id);
                this.onRawOrderbookData(pair, rawOrderbookData);
            }
        }
        if (channel === 'instruments') {
            this.onRawInstrumentsData(raw.data[0]);
        }
    }
    onRawInstrumentsData(rawInstrumentData) {
        for (const instrument of rawInstrumentData) {
            if (!(instrument.underlying_index === 'BTC'
                && instrument.quote_currency === 'USD'))
                continue;
            const marketDescriptor = {
                instrumentId: instrument.instrument_id,
                tradesChannel: `futures/trade:${instrument.instrument_id}`,
                orderbookChannel: `futures/depth:${instrument.instrument_id}`,
            };
            if (instrument.alias === 'this_week')
                mapping_1.marketDescriptors['BTC-USD-THIS-WEEK/USD']
                    = marketDescriptor;
            if (instrument.alias === 'next_week')
                mapping_1.marketDescriptors['BTC-USD-NEXT-WEEK/USD']
                    = marketDescriptor;
            if (instrument.alias === 'quarter')
                mapping_1.marketDescriptors['BTC-USD-QUARTER/USD']
                    = marketDescriptor;
        }
    }
    onRawTradeData(pair, rawTradesData) {
        const isContract = pair !== 'BTC/USDT';
        const trade = raw_trades_handler_1.formatRawTrade(rawTradesData, isContract);
        const sentData = { trades: [trade] };
        this.center[pair].send(JSON.stringify(sentData));
    }
    onRawOrderbookData(pair, rawOrderbookData) {
        const orderbook = this.rawOrderbookHandler[pair]
            .handle(rawOrderbookData);
        const sentData = { orderbook };
        this.center[pair].send(JSON.stringify(sentData));
    }
    subscribeInstruments() {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = 'futures/instruments';
            this.okex.subscribe(channel);
            const onIdSub = (raw) => {
                if (raw.channel === channel
                    && raw.event === 'subscribe')
                    this.okex.emit('subscribed');
            };
            this.okex.on('rawData', onIdSub);
            yield events_1.once(this.okex, 'subscribed');
            this.okex.off('rawData', onIdSub);
        });
    }
    subscribeTrades() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const { tradesChannel } of Object.values(mapping_1.marketDescriptors)) {
                this.okex.subscribe(tradesChannel);
                const onTradesSub = (raw) => {
                    if (raw.channel === tradesChannel
                        && raw.event === 'subscribe')
                        this.okex.emit('subscribed');
                };
                this.okex.on('rawData', onTradesSub);
                yield events_1.once(this.okex, 'subscribed');
                this.okex.off('rawData', onTradesSub);
            }
        });
    }
    subscribeOrderbook() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const pair in mapping_1.marketDescriptors) {
                const { orderbookChannel } = mapping_1.marketDescriptors[pair];
                const isContract = pair !== 'BTC/USDT';
                this.rawOrderbookHandler[pair]
                    = new raw_orderbook_handler_1.default(isContract);
                this.okex.subscribe(orderbookChannel);
                const onOrderbookSub = (raw) => {
                    if (raw.channel === orderbookChannel
                        && raw.event === 'subscribe')
                        this.okex.emit('subscribed');
                };
                this.okex.on('rawData', onOrderbookSub);
                yield events_1.once(this.okex, 'subscribed');
                this.okex.off('rawData', onOrderbookSub);
            }
        });
    }
}
__decorate([
    autobind_decorator_1.boundMethod
], QuoteAgentOkexWebsocket.prototype, "onRawData", null);
exports.default = QuoteAgentOkexWebsocket;
//# sourceMappingURL=index.js.map