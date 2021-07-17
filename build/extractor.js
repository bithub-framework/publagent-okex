"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extractor = void 0;
const startable_1 = require("startable");
const server_1 = require("./server");
const assert = require("assert");
const identifier_cases_1 = require("identifier-cases");
const interfaces_1 = require("./interfaces");
class Extractor extends startable_1.Startable {
    constructor(stream, broadcast) {
        super();
        this.stream = stream;
        this.broadcast = broadcast;
        this.stream.on('message', (message) => {
            try {
                if (interfaces_1.isRawTradesMessage(message, this.rawInstrumentId)) {
                    const trades = message.data
                        .map(rawTrade => this.normalizeRawTrade(rawTrade));
                    this.broadcast.emit(`${this.mid}/trades`, trades);
                }
                if (interfaces_1.isRawOrderbookMessage(message, this.rawInstrumentId)) {
                    const latest = message.data[message.data.length - 1];
                    const orderbook = this.normalizeRawOrderbook(latest);
                    this.broadcast.emit(`${this.mid}/orderbook`, orderbook);
                }
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
        });
    }
    async _start() {
        assert(identifier_cases_1.kebabCase.test(this.mid));
        this.server = new server_1.Server(this.mid, this.broadcast);
        await this.subscriptionOperate('subscribe', 'trades');
        await this.subscriptionOperate('subscribe', 'books5');
        await this.server.start(this.starp);
    }
    async _stop() {
        if (this.server)
            await this.server.stop();
        await this.subscriptionOperate('unsubscribe', 'trades');
        await this.subscriptionOperate('unsubscribe', 'books5');
    }
    async subscriptionOperate(operation, rawChannel) {
        await this.stream.send({
            op: operation,
            args: [{
                    channel: rawChannel,
                    instId: this.rawInstrumentId,
                }],
        });
        await new Promise((resolve, reject) => {
            const onMessage = (message) => {
                if (interfaces_1.isRawUnSubscription(message, operation, this.rawInstrumentId, rawChannel)) {
                    this.stream.off('message', onMessage);
                    resolve();
                }
                if (interfaces_1.isRawError(message)) {
                    this.stream.off('message', onMessage);
                    reject(new Error(message.msg));
                }
            };
            this.stream.on('message', onMessage);
        });
    }
}
exports.Extractor = Extractor;
//# sourceMappingURL=extractor.js.map