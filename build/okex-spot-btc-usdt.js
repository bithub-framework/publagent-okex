"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkexSpotBtcUsdt = void 0;
const extractor_1 = require("./extractor");
const interfaces_1 = require("./interfaces");
const big_js_1 = require("big.js");
function normalizeRawOrder(rawBookOrder, side) {
    return {
        price: new big_js_1.default(rawBookOrder[0]),
        quantity: new big_js_1.default(rawBookOrder[1]),
        side,
    };
}
class OkexSpotBtcUsdt extends extractor_1.Extractor {
    constructor() {
        super(...arguments);
        this.mid = 'okex-spot-btc-usdt';
        this.rawInstrumentId = 'BTC-USDT';
    }
    normalizeRawTrade(rawTrade) {
        return {
            side: rawTrade.side === 'buy' ? interfaces_1.Side.BID : interfaces_1.Side.ASK,
            price: new big_js_1.default(rawTrade.px),
            quantity: new big_js_1.default(rawTrade.sz),
            time: Number.parseInt(rawTrade.ts),
            id: rawTrade.tradeId,
        };
    }
    normalizeRawOrderbook(rawOrderbook) {
        return {
            [interfaces_1.Side.ASK]: rawOrderbook.asks.map(rawBookOrder => normalizeRawOrder(rawBookOrder, interfaces_1.Side.ASK)),
            [interfaces_1.Side.BID]: rawOrderbook.bids.map(rawOrder => normalizeRawOrder(rawOrder, interfaces_1.Side.BID)),
            time: Number.parseInt(rawOrderbook.ts),
        };
    }
}
exports.OkexSpotBtcUsdt = OkexSpotBtcUsdt;
//# sourceMappingURL=okex-spot-btc-usdt.js.map