"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const autonomous_1 = __importDefault(require("autonomous"));
const events_1 = require("events");
const autobind_decorator_1 = require("autobind-decorator");
const official_v3_websocket_client_modified_1 = __importDefault(require("./official-v3-websocket-client-modified"));
const raw_orderbook_handler_1 = __importDefault(require("./raw-orderbook-handler"));
const raw_trades_handler_1 = __importDefault(require("./raw-trades-handler"));
const mapping_1 = require("./mapping");
const config = fs_extra_1.readJsonSync(path_1.join(__dirname, '../cfg/config.json'));
const ACTIVE_CLOSE = 4000;
class PublicAgentOkexWebsocket extends autonomous_1.default {
    constructor() {
        super(...arguments);
        this.center = {};
        this.rawOrderbookHandler = {};
    }
    async _start() {
        await this.connectOkex();
        await this.connectPublicCenter();
        this.okex.on('rawData', this.onRawData);
        await this.subscribeTrades();
        await this.subscribeOrderbook();
    }
    async _stop() {
        if (this.okex)
            this.okex.close(ACTIVE_CLOSE);
        for (const center of Object.values(this.center)) {
            if (center.readyState < 2)
                center.close(ACTIVE_CLOSE);
            if (center.readyState < 3)
                await events_1.once(center, 'close');
        }
    }
    async connectPublicCenter() {
        for (const pair in mapping_1.marketDescriptors) {
            const center = this.center[pair] = new ws_1.default(`${config.PUBLIC_CENTER_BASE_URL}/okex/${pair}`);
            center.on('close', (code, reason) => {
                if (code !== ACTIVE_CLOSE) {
                    console.error(new Error(`public center for ${pair} closed`));
                    this.stop();
                }
            });
            center.on('error', console.error);
            await events_1.once(center, 'open');
        }
    }
    async connectOkex() {
        this.okex = new official_v3_websocket_client_modified_1.default(config.OKEX_WEBSOCKET_URL);
        this.okex.on('message', (msg) => void this.okex.emit('rawData', JSON.parse(msg)));
        this.okex.on('rawData', (raw) => {
            if (raw.event === 'error')
                this.okex.emit('error', new Error(raw.message));
        });
        this.okex.on('close', (code, reason) => {
            if (code !== ACTIVE_CLOSE) {
                console.error(new Error('okex closed'));
                this.stop();
            }
        });
        this.okex.on('error', (err) => {
            console.error(err);
        });
        this.okex.connect();
        await events_1.once(this.okex, 'open');
    }
    onRawData(raw) {
        try {
            const { table } = raw;
            if (!table)
                return;
            const channel = mapping_1.getChannel(table);
            if (channel === 'trades') {
                for (const rawTrade of raw.data) {
                    const { instrument_id } = rawTrade;
                    const pair = mapping_1.getPair(table, instrument_id);
                    this.onRawTradeData(pair, rawTrade);
                }
            }
            if (channel === 'orderbook') {
                for (const rawOrderbookData of raw.data) {
                    const { instrument_id } = rawOrderbookData;
                    const pair = mapping_1.getPair(table, instrument_id);
                    this.onRawOrderbookData(pair, rawOrderbookData);
                }
            }
        }
        catch (err) {
            console.error(err);
            this.stop();
        }
    }
    onRawTradeData(pair, rawTrade) {
        const isPerpetual = pair !== 'BTC/USDT';
        const trade = raw_trades_handler_1.default(rawTrade, isPerpetual);
        const sentData = { trades: [trade] };
        this.center[pair].send(JSON.stringify(sentData));
    }
    onRawOrderbookData(pair, rawOrderbookData) {
        const orderbook = this.rawOrderbookHandler[pair]
            .handle(rawOrderbookData);
        const sentData = { orderbook };
        this.center[pair].send(JSON.stringify(sentData));
    }
    async subscribeTrades(pair) {
        for (const { tradesChannel } of pair
            ? [mapping_1.marketDescriptors[pair]]
            : Object.values(mapping_1.marketDescriptors)) {
            this.okex.subscribe(tradesChannel);
            const onTradesSub = (raw) => {
                if (raw.channel === tradesChannel
                    && raw.event === 'subscribe')
                    this.okex.emit('subscribed');
            };
            this.okex.on('rawData', onTradesSub);
            await events_1.once(this.okex, 'subscribed');
            this.okex.off('rawData', onTradesSub);
        }
    }
    async subscribeOrderbook() {
        for (const pair in mapping_1.marketDescriptors) {
            const { orderbookChannel } = mapping_1.marketDescriptors[pair];
            const isPerpetual = pair !== 'BTC/USDT';
            this.rawOrderbookHandler[pair]
                = new raw_orderbook_handler_1.default(isPerpetual);
            this.okex.subscribe(orderbookChannel);
            const onOrderbookSub = (raw) => {
                if (raw.channel === orderbookChannel
                    && raw.event === 'subscribe')
                    this.okex.emit('subscribed');
            };
            this.okex.on('rawData', onOrderbookSub);
            await events_1.once(this.okex, 'subscribed');
            this.okex.off('rawData', onOrderbookSub);
        }
    }
}
__decorate([
    autobind_decorator_1.boundMethod
], PublicAgentOkexWebsocket.prototype, "onRawData", null);
exports.PublicAgentOkexWebsocket = PublicAgentOkexWebsocket;
exports.default = PublicAgentOkexWebsocket;
//# sourceMappingURL=index.js.map