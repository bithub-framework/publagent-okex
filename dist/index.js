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
const ws_1 = __importDefault(require("ws"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const autonomous_1 = __importDefault(require("autonomous"));
const events_1 = require("events");
// import RawOrderbookHandler from './raw-orderbook-handler';
// import { formatRawTrades } from './raw-trades-handler';
// import {
//     RawOrderbook,
//     RawTrades,
//     QuoteDataFromAgentToCenter as QDFATC,
// } from './interfaces';
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../cfg/config.json'));
// type RawData = any;
const ACTIVE_CLOSE = 4000;
class QuoteAgentOkexWebsocket extends autonomous_1.default {
    // private rawOrderbookHandler = new RawOrderbookHandler();
    _start() {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.connectOkex();
            yield this.connectQuoteCenter();
            // this.okex.on('rawData', this.onRawData);
            // await this.subscribeTrades();
            // await this.subscribeOrderbook();
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
}
exports.default = QuoteAgentOkexWebsocket;
//# sourceMappingURL=index.js.map