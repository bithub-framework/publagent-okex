import Startable from 'startable';
import { EXCHANGE_NAME } from './config';
/*
    events
        '<marketName>/<pair>/trades' trades
        '<marketName>/<pair>/orderbook' orderbook
*/
class Normalizer extends Startable {
    constructor(deserializer, broadcast) {
        super();
        this.deserializer = deserializer;
        this.broadcast = broadcast;
        this.onRawTrades = (rawTrades) => {
            try {
                const trades = rawTrades
                    .map(rawTrade => this.normalizeRawTrade(rawTrade));
                this.broadcast.emit(`${EXCHANGE_NAME}/${this.pair}/trades`, trades);
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
        };
        this.onRawOrderbook = (rawOrderbook) => {
            try {
                const orderbook = this.normalizeRawOrderbook(rawOrderbook);
                this.broadcast.emit(`${EXCHANGE_NAME}/${this.pair}/orderbook`, orderbook);
            }
            catch (err) {
                this.stop(err).catch(() => { });
            }
        };
    }
    async _start() {
        this.deserializer.on(`trades/${this.rawInstrumentId}`, this.onRawTrades);
        this.deserializer.on(`orderbook/${this.rawInstrumentId}`, this.onRawOrderbook);
        await this.unSubscribe('subscribe');
    }
    async _stop() {
        this.deserializer.off(`trades/${this.rawInstrumentId}`, this.onRawTrades);
        this.deserializer.off(`orderbook/${this.rawInstrumentId}`, this.onRawOrderbook);
    }
    async unSubscribe(operation) {
        await this.deserializer.send({
            op: operation,
            args: [
                this.rawTradesChannel,
                this.rawOrderbookChannel,
            ],
        });
        const waitForUnSub = (rawChannel) => {
            return new Promise((resolve, reject) => {
                const onUnSub = (rawUnSub) => {
                    if (rawUnSub.channel === rawChannel) {
                        this.deserializer.off(`${operation}/${rawChannel}`, onUnSub);
                        this.deserializer.off('error', reject);
                        resolve();
                    }
                };
                this.deserializer.on(`${operation}/${rawChannel}`, onUnSub);
                this.deserializer.on('error', reject);
            });
        };
        await Promise.all([
            waitForUnSub(this.rawTradesChannel),
            waitForUnSub(this.rawOrderbookChannel),
        ]);
    }
}
export { Normalizer as default, Normalizer, };
//# sourceMappingURL=normalizer.js.map