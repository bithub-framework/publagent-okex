"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const okex_node_1 = require("@okfe/okex-node");
class QuoteAgentOkexWebsocket {
    constructor() {
        this.okex = new okex_node_1.V3WebsocketClient();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.okex.connect();
            yield new Promise((resolve, reject) => {
                this.okex.once('open', resolve);
                this.okex.once('error', reject);
            });
            this.okex.subscribe('spot/trade:btc-ustd');
            this.okex.on('message', msg => void console.log(msg));
        });
    }
    stop() {
        this.okex.close();
    }
}
exports.default = QuoteAgentOkexWebsocket;
//# sourceMappingURL=index.js.map